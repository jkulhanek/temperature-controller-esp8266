#ifndef _server_h
#define _server_h
#define DATETIME_LENGTH sizeof("2011-10-08T07:07:09Z")
#define HTTP
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#ifdef HTTPS
#include <ESP8266WebServerSecure.h>
#else
#include <ESP8266WebServer.h>
#endif
#include <ESP8266mDNS.h>
#include <FS.h>
#include <ArduinoJson.h>
#include <time.h>
#include "settings.h"

#ifdef HTTPS
ESP8266WebServerSecure server(443);

static const char serverCert[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIID3jCCAsagAwIBAgIUKbllW2IFEQAU9z4x11J+yd0THfgwDQYJKoZIhvcNAQEL
BQAwgYsxCzAJBgNVBAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMTQw
MgYDVQQLEytDbG91ZEZsYXJlIE9yaWdpbiBTU0wgQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlh
MB4XDTE5MDkwMjE1NTUwMFoXDTM0MDgyOTE1NTUwMFowYjEZMBcGA1UEChMQQ2xv
dWRGbGFyZSwgSW5jLjEdMBsGA1UECxMUQ2xvdWRGbGFyZSBPcmlnaW4gQ0ExJjAk
BgNVBAMTHUNsb3VkRmxhcmUgT3JpZ2luIENlcnRpZmljYXRlMFwwDQYJKoZIhvcN
AQEBBQADSwAwSAJBAOcDq3dHlvNvoK+OIVzSe8t5CwQg9dob+y3wbKDM7CZeUTHI
TqHw8xeHDFSBCFvynxZz38Hxm0nD4Kl7HgOOE+sCAwEAAaOCASgwggEkMA4GA1Ud
DwEB/wQEAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwEwDAYDVR0T
AQH/BAIwADAdBgNVHQ4EFgQUS5k0efFwCmIgecI3BDaDTPNi5EowHwYDVR0jBBgw
FoAUJOhTV118NECHqeuU27rhFnj8KaQwQAYIKwYBBQUHAQEENDAyMDAGCCsGAQUF
BzABhiRodHRwOi8vb2NzcC5jbG91ZGZsYXJlLmNvbS9vcmlnaW5fY2EwKQYDVR0R
BCIwIIIPKi5rdWxoYW5rb3ZpLnRrgg1rdWxoYW5rb3ZpLnRrMDgGA1UdHwQxMC8w
LaAroCmGJ2h0dHA6Ly9jcmwuY2xvdWRmbGFyZS5jb20vb3JpZ2luX2NhLmNybDAN
BgkqhkiG9w0BAQsFAAOCAQEAkcDdGJ7oN1Sy0KC663oAZQuxX/PwfB25KeFj0PFH
YDDvfH4M39cw+rBqYC2vc7fXvURZZIxQVT34mDU5OncHZxBBzkUpftQ9ObOVg7F/
40M/DF240apzaggUtCdV2l6Jb43HunizlGtLcyk3zOb3/Vnw/zI4AFcuOh7ierx8
QAyj5b+uYbuOeBgOEeKu4y3mw1ypc4ob5HsAFasqeEMK3ZhbxqtLr0xCIDoybZXb
nPLsiymqc7d7HDZ0DI+KHQLSY459okZ6rmhFv8dxhYVlGcFQFqvm09M77i88tV4Z
3Qgr8CpBo6Em/ZzmFwPbqCYr0plc86K2UyJn6tm8fN127A==
-----END CERTIFICATE-----
)EOF";
static const char serverKey[] PROGMEM = R"EOF(
-----BEGIN PRIVATE KEY-----
MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA5wOrd0eW82+gr44h
XNJ7y3kLBCD12hv7LfBsoMzsJl5RMchOofDzF4cMVIEIW/KfFnPfwfGbScPgqXse
A44T6wIDAQABAkArh5B+qFm0Qzt2+QQmVm8HNyaxP3i0AYPB80S0xAhXbiCLlQo8
K6o4xY86FnOI2/C9XkuBhv6D38FvimPdnNIxAiEA/TgkkHGKYDD+yl5+NUqrGvzy
i3H0YxoGpt2WdXLLcwMCIQDpjRqNgnl4yrdwrIdCHSs04d0wPsXDxGQz8cAkzYcS
+QIhAOP6NBFH6AmKkxqn0IEyZLK7obMiOaEvwWVigx/i5oD5AiAvhIwAeqloUCZe
gFvMsc6WpdWw+TSXjh+tCeTEGCUBUQIgWxUk7eoq2PaKmUYpxJw7TwqIsEvFVoQK
HB7zNPhS+t8=
-----END PRIVATE KEY-----
)EOF";
#else
ESP8266WebServer server(80);
#endif

const char* www_username = "admin";
const char* www_password = "esp8266";
const char* www_realm = "Custom Auth Realm";
String authFailResponse = "Authentication Failed";

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

bool handleAuthentication() {
    if (!server.authenticate(www_username, www_password)) {
        server.requestAuthentication(HTTPAuthMethod::BASIC_AUTH, www_realm, authFailResponse);
        return true;
    }

    return false;
}

bool handleHttpOptions() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "PUT,POST,GET,OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (server.method() == HTTP_OPTIONS) {
        server.sendHeader("Access-Control-Max-Age", "10000");
        server.send(204);
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
        if(!isWriteable(path)) {
            server.sendHeader("Cache-Control","max-age=31536000");
        }
        else {
            if(handleAuthentication()) return true;
        }
        server.streamFile(file, contentType);
        file.close();
        return true;
    }
    return false;
}

bool handleFile(String path) {
    if(handleHttpOptions()) return true;

    HTTPMethod method = server.method();
    if(method == HTTPMethod::HTTP_GET) {
        return handleFileRead(path);
    }
    else {
        if(handleAuthentication()) return true;
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
    if(handleHttpOptions()) return;
    if(handleAuthentication()) return;

    time_t now;
    time(&now);
    auto method = server.method();
    if(method == HTTP_GET) {
        settings_t * settings = getSettings();
        if(!thermostat.validateTemporaryTemperature(&now)) {
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
        if(!saveSettings()) {
            server.send(500, "text/plain", "Internal error");
            Serial.println("Cannot save settings");
            return;
        }
        server.send(200, "application/json", "");
        thermostat.invalidateCurrentUserTemperature();
        return;
    }

    server.send(403, "text/plain", "Forbidden");
}

void handleCurrentPlan() {
    if(handleHttpOptions()) return;
    if(handleAuthentication()) return;

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

        if(!saveSettings()) {
            server.send(500, "text/plain", "Internal error");
            Serial.println("Cannot save settings");
            return;
        }
        server.send(200, "application/json", "");
        thermostat.invalidateCurrentUserTemperature();
        return;
    }

    server.send(403, "text/plain", "Forbidden");
}

void handleOn() {
    if(handleHttpOptions()) return;
    if(handleAuthentication()) return;

    auto method = server.method();
    auto settings = getSettings();
    if(method == HTTP_GET) {
    }
    else if(method == HTTP_POST) {
        String json(server.arg("plain"));
        DynamicJsonDocument doc(256);
        DeserializationError error = deserializeJson(doc, json);
        if (error) {
            server.send(400, "text/plain", "Bad request");
            return;
        }

        settings->isOn = doc["isOn"];

        if(!saveSettings()) {
            server.send(500, "text/plain", "Internal error");
            Serial.println("Cannot save settings");
            return;
        }
        thermostat.invalidateCurrentUserTemperature();
    } else {
        server.send(403, "text/plain", "Forbidden");
        return;
    }

    server.send(200, "application/json", "{\"isOn\":" + String(settings->isOn ? "true }":"false }"));
    return;
}

void handleLogin() {
    if(handleHttpOptions()) return;
    if(server.authenticate(www_username, www_password)) {
        server.send(200, "text/plain", "valid");
    }
    else {
        server.send(200, "text/plain", "invalid");
    }    
    return;
}

void handleCurrentTemperature() {
    if(handleHttpOptions()) return;
    if(handleAuthentication()) return;


    char timeStr[DATETIME_LENGTH];
    time_t now;
    float temp;
    time(&now);
    strftime(timeStr, sizeof(timeStr), "%FT%TZ", gmtime(&now));
    String json("{\"time\":\"");
    json += timeStr;
    json += "\"";
    json += ",\"temperature\":";
    if(thermostat.getCurrentTemperature(&temp))
        json += temp;  
    else
        json += "null";
    json += ",\"userTemperature\":";
    if(thermostat.getUserTemperature(&temp))
        json += temp;
    else
        json += "null";
    json += "}";
    server.send(200, "application/json", json);
}

bool initializeServer() {
    if (MDNS.begin("esp8266")) {
        Serial.println("MDNS responder started");
    } else {
        Serial.println("MDNS failed");
        return false;
    }

    #ifdef HTTPS

    server.setRSACert(new BearSSL::X509List(serverCert), new BearSSL::PrivateKey(serverKey));
    #endif
    
    server.on("/list", handleFileList);
    server.on("/api/temporaryTemperature", handleTemporaryTemperature);
    server.on("/api/temperature", HTTP_GET, handleCurrentTemperature);
    server.on("/api/plan", handleCurrentPlan);
    server.on("/api/on", handleOn);
    server.on("/api/login", handleLogin);
    server.onNotFound([]() {
        if (!handleFile(server.uri())) {
            handleNotFound();
        }
    });

    server.begin();
    #ifdef HTTPS
    MDNS.addService("https", "tcp", 443);
    #else
    MDNS.addService("http", "tcp", 80);
    #endif
    Serial.println("HTTP server started");
    return true;
}

#endif
