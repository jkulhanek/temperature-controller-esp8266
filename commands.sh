arduino-cli compile --fqbn esp8266:esp8266:nodemcuv2 controller
arduino-cli upload -p /dev/ttyUSB0 --fqbn esp8266:esp8266:nodemcuv2 controller


esptool.py --port /dev/ttyUSB0 write_flash 0x00000 controller.esp8266.esp8266.nodemcuv2.bin 0x200000 my_app.elf-0x40000.bin