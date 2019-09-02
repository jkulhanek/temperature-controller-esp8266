cmake_minimum_required(VERSION 3.10)
project(controller)


file(DOWNLOAD https://github.com/earlephilhower/esp-quick-toolchain/releases/download/2.5.0-4/x86_64-linux-gnu.mkspiffs-7fefeac.1563313032.tar.gz ./external/mkspiffs.tar.gz)
execute_process(COMMAND ${CMAKE_COMMAND} -E tar xvzf ./external/mkspiffs.tar.gz)
execute_process(COMMAND npm --prefix "${CMAKE_SOURCE_DIR}/server" install)

file(GLOB SERVER_FILES "${CMAKE_SOURCE_DIR}/server/**/*")
set(SERVER_OUTPUT
    ${CMAKE_SOURCE_DIR}/server/dist/index.html
    ${CMAKE_SOURCE_DIR}/server/dist/logo.svg
    ${CMAKE_SOURCE_DIR}/server/dist/main.js
    ${CMAKE_SOURCE_DIR}/server/dist/styles.js
    ${CMAKE_SOURCE_DIR}/server/dist/styles.css
)
add_custom_command(OUTPUT ${SERVER_OUTPUT} COMMAND npm ARGS --prefix "${CMAKE_SOURCE_DIR}/server" run build
    DEPENDS ${SERVER_FILES})

file(GLOB CONTROLLER_FILES "${CMAKE_SOURCE_DIR}/server/**/*")
add_custom_command(OUTPUT ${CMAKE_BINARY_DIR}/spiffs.bin COMMAND ${CMAKE_BINARY_DIR}/mkspiffs/mkspiffs ARGS -p 256 -b 8192 -s 2076672 -c ${CMAKE_SOURCE_DIR}/server/dist ${CMAKE_BINARY_DIR}/spiffs.bin
    DEPENDS ${SERVER_OUTPUT})

add_custom_command(OUTPUT ${CMAKE_BINARY_DIR}/controller_program.bin COMMAND bash ARGS -c "arduino-cli compile -o ${CMAKE_BINARY_DIR}/controller_program --fqbn esp8266:esp8266:nodemcuv2 ${CMAKE_SOURCE_DIR}/controller" 
    DEPENDS ${CONTROLLER_FILES})

add_custom_target(controller DEPENDS ${CMAKE_BINARY_DIR}/spiffs.bin ${CMAKE_BINARY_DIR}/controller_program.bin)
#add_custom_target(server_compressed bash -c "for i in server_data/*; do tar -czf $i.gz $i; done")    

add_custom_target(flash_data esptool.py --chip esp8266 --port /dev/ttyUSB0 write_flash 0x200000 ${CMAKE_BINARY_DIR}/spiffs.bin
    DEPENDS ${CMAKE_BINARY_DIR}/spiffs.bin)

add_custom_target(flash_program
    arduino-cli compile --fqbn esp8266:esp8266:nodemcuv2 ${CMAKE_SOURCE_DIR}/controller
    COMMAND arduino-cli upload -p /dev/ttyUSB0 --fqbn esp8266:esp8266:nodemcuv2 ${CMAKE_SOURCE_DIR}/controller
    DEPENDS ${CONTROLLER_FILES})

add_custom_target(flash
    DEPENDS flash_data flash_program)

#add_custom_command(TARGET server POST_BUILD COMMAND rm -rf ../server/dist)


#

