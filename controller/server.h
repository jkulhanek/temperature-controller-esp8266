#ifndef _server_h
#define _server_h
#define DATETIME_LENGTH sizeof("2011-10-08T07:07:09Z")

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <FS.h>
#include <ArduinoJson.h>
#include <time.h>
#include "settings.h"
#include "temperature.h"

ESP8266WebServer server(80);

String getContentType(String filename) {
    if (server.hasArg("download")) {
        return "application/octet-stream";
    } else if (filename.endsWith(".htm")) {
        return "text/html";
    } else if (filename.endsWith(".html")) {
        return "text/html";
    } else if (filename.endsWith(".css")) {
        return "text/css";
    } else if (filename.endsWith(".js")) {
        return "application/javascript";
    } else if (filename.endsWith(".json")) {
        return "application/json";
    } else if (filename.endsWith(".png")) {
        return "image/png";
    } else if (filename.endsWith(".gif")) {
        return "image/gif";
    } else if (filename.endsWith(".jpg")) {
        return "image/jpeg";
    } else if (filename.endsWith(".ico")) {
        return "image/x-icon";
    } else if (filename.endsWith(".xml")) {
        return "text/xml";
    } else if (filename.endsWith(".pdf")) {
        return "application/x-pdf";
    } else if (filename.endsWith(".zip")) {
        return "application/x-zip";
    } else if (filename.endsWith(".svg")) {
        return "image/svg+xml";
    } else if (filename.endsWith(".gz")) {
        return "application/x-gzip";
    }
    return "text/plain";
}

void handleFileList() {
  String path = String();
  Dir dir = SPIFFS.openDir("/");

  String output = "[";
  while (dir.next()) {
    File entry = dir.openFile("r");
    if (output != "[") {
      output += ',';
    }
    bool isDir = false;
    output += "{\"type\":\"";
    output += (isDir) ? "dir" : "file";
    output += "\",\"name\":\"";
    output += String(entry.name()).substring(1);
    output += "\"}";
    entry.close();
  }

  output += "]";
  server.send(200, "text/json", output);
}

bool isWriteable(String path) {
    return path.startsWith("/data");
}

bool handleFileUpdate(String path) {
    File f = SPIFFS.open(path, "w+");
    if(!f) {
        server.send(500, "text/plain", "Internal server error");
        return true;
    }
            
    String content = server.arg("plain");
    f.write(content.c_str());
    f.flush();
    f.close();
    server.send(200, "text/plain", "");
    return true;
}

bool handleFileDelete(String path) {
    if (SPIFFS.exists(path)) {
        if(!SPIFFS.remove(path)) {
            server.send(500, "text/plain", "Internal server error");
        }
        else{
            server.send(200, "text/plain", "");
        }
        return true;
    }
    return false;
}


bool handleFileRead(String path) {
    if (path.endsWith("/")) {
        path += "index.html";
    }
    String contentType = getContentType(path);
    String pathWithGz = path + ".gz";
    if (SPIFFS.exists(pathWithGz) || SPIFFS.exists(path)) {
        if (SPIFFS.exists(pathWithGz)) {
            path += ".gz";
        }
        File file = SPIFFS.open(path, "r");
        server.streamFile(file, contentType);
        file.close();
        return true;
    }
    return false;
}

bool handleFile(String path) {
    HTTPMethod method = server.method();
    if(method == HTTPMethod::HTTP_GET) {
        return handleFileRead(path);
    }
    else {
        if(!isWriteable(path)) {
            server.send(403, "text/plain", "Forbidden");
            return true;
        }
    }
    
    if(method == HTTP_POST || method == HTTP_PUT) {
        return handleFileUpdate(path);
    }
    else if(method == HTTP_DELETE) {
        return handleFileDelete(path);
    }
}

void handleNotFound() {
    String message = "File Not Found\n\n";
    message += "URI: ";
    message += server.uri();
    message += "\nMethod: ";
    message += (server.method() == HTTP_GET) ? "GET" : "POST";
    message += "\nArguments: ";
    message += server.args();
    message += "\n";

    for (uint8_t i = 0; i < server.args(); i++) {
        message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
    }

    server.send(404, "text/plain", message);
}

void handleTemporaryTemperature() {
    time_t now;
    time(&now);
    auto method = server.method();
    if(method == HTTP_GET) {
        settings_t * settings = getSettings();
        if(!validateTemporaryTemperature(&now)) {
            server.send(200, "application/json", "null");
        } else {
            char timeStr[DATETIME_LENGTH];
            strftime(timeStr, sizeof(timeStr), "%FT%TZ", gmtime(&settings->temporaryTemperature.start));
            DynamicJsonDocument doc(1024);
            doc["temperature"] = settings->temporaryTemperature.temperature;
            doc["duration"] = settings->temporaryTemperature.duration;
            doc["start"] = String(timeStr);
            String json;
            serializeJson(doc, json);
            server.send(200, "application/json", json);
        }
        return;
    } else if(method == HTTP_PUT) {
        String json(server.arg("plain"));
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, json);
        if (error) {
            server.send(400, "text/plain", "Bad request");
            return;
        }

        float temperature = doc["temperature"];
        long duration = doc["duration"];

        settings_t * settings = getSettings();
        settings->temporaryTemperature.temperature = temperature;
        settings->temporaryTemperature.duration = duration;
        settings->temporaryTemperature.isSet = true;
        settings->temporaryTemperature.start = now;
        saveSettings();
        server.send(200, "application/json", "");
        return;
    }

    server.send(403, "text/plain", "Forbidden");
}

void handleCurrentPlan() {
    auto method = server.method();
    if(method == HTTP_GET) {
        settings_t * settings = getSettings();
        
        String plan("{\"time\":\"");
        {
            char timeStr[DATETIME_LENGTH];
            time_t now;
            time(&now);
            strftime(timeStr, sizeof(timeStr), "%FT%TZ", gmtime(&now));
            plan += String(timeStr);
        }
        plan += "\",\"currentPlanId\":";
        plan += settings->currentPlanId;
        plan += ",\"plan\":[";
        unsigned int i;
        for(i=0;i<7*24 - 1;++i) {
            plan += decompressTemperature(settings->currentPlan[i]);
            plan += ",";
        }
        plan += settings->currentPlan[i];
        plan += "]}";
        server.send(200, "application/json", plan);
        return;
    } else if(method == HTTP_PUT) {
        String json(server.arg("plain"));
        DynamicJsonDocument doc(8192);
        DeserializationError error = deserializeJson(doc, json);
        if (error) {
            server.send(400, "text/plain", "Bad request");
            return;
        }

        {
            int planId = doc["currentPlanId"];
            JsonArray plan = doc["plan"];
            settings_t * settings = getSettings();
            for(unsigned int i=0;i<7*24;++i) {
                settings->currentPlan[i] = compressTemperature(plan[i]);
            }
            settings->currentPlanId = planId;
        }

        saveSettings();
        server.send(200, "application/json", "");
        return;
    }

    server.send(403, "text/plain", "Forbidden");
}

void handleCurrentTemperature() {
    char timeStr[DATETIME_LENGTH];
    time_t now;
    time(&now);
    strftime(timeStr, sizeof(timeStr), "%FT%TZ", gmtime(&now));
    String json("{\"time\":\"");
    json += timeStr;
    json += "\",\"temperature\":";
    json += 13.3;
    json += ",\"userTemperature\":";
    json += getCurrentUserTemperature();
    json += "}";
    server.send(200, "application/json", json);
}

bool initializeServer() {
    if(!SPIFFS.begin()) {
        Serial.println("SPIFFS failed");
        return false;
    }

    if (MDNS.begin("esp8266")) {
        Serial.println("MDNS responder started");
    } else {
        Serial.println("MDNS failed");
        return false;
    }

    server.on("/list", handleFileList);
    server.on("/api/temporaryTemperature", handleTemporaryTemperature);
    server.on("/api/temperature", HTTP_GET, handleCurrentTemperature);
    server.on("/api/plan", handleCurrentPlan);
    server.onNotFound([]() {
        if (!handleFile(server.uri())) {
            handleNotFound();
        }
    });

    server.begin();
    Serial.println("HTTP server started");
    return true;
}

#endif
