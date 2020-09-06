## Installation
First install arduino-cli.

```
$ arduino-cli --config-file controller/arduino-cli.yaml core update-index
$ arduino-cli --config-file controller/arduino-cli.yaml core install arduino:avr
$ arduino-cli --config-file controller/arduino-cli.yaml core install esp8266:esp8266 
$ arduino-cli lib install "Adafruit GFX Library"
$ arduino-cli lib install "Adafruit SSD1306"
$ arduino-cli lib install "OneWire"
$ arduino-cli lib install "DallasTemperature"
$ arduino-cli lib install "ArduinoJson"
```
