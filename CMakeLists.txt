cmake_minimum_required(VERSION 3.10)
project(controller)


file(DOWNLOAD https://github.com/earlephilhower/esp-quick-toolchain/releases/download/2.5.0-4/x86_64-linux-gnu.mkspiffs-7fefeac.1563313032.tar.gz ./external/mkspiffs.tar.gz)
execute_process(COMMAND ${CMAKE_COMMAND} -E tar xvzf ./external/mkspiffs.tar.gz)
execute_process(COMMAND npm --prefix "${CMAKE_SOURCE_DIR}/server" install)

file(GLOB SERVER_FILES "${CMAKE_SOURCE_DIR}/server/**/*")
set(SERVER_OUTPUT
    ${CMAKE_BINARY_DIR}/server/index.html.gz
    ${CMAKE_BINARY_DIR}/server/logo.svg.gz
    ${CMAKE_BINARY_DIR}/server/main.js.gz
    ${CMAKE_BINARY_DIR}/server/styles.js.gz
    ${CMAKE_BINARY_DIR}/server/styles.css.gz
)

add_custom_command(OUTPUT ${SERVER_OUTPUT} 
    COMMAND npm ARGS --prefix "${CMAKE_SOURCE_DIR}/server" run build
    COMMAND gzip "${CMAKE_SOURCE_DIR}/server/dist/*"
)

file(GLOB CONTROLLER_FILES "${CMAKE_SOURCE_DIR}/controller/**/*")
add_custom_command(OUTPUT ${CMAKE_BINARY_DIR}/spiffs.bin COMMAND ${CMAKE_BINARY_DIR}/mkspiffs/mkspiffs ARGS -p 256 -b 8192 -s 2076672 -c ${CMAKE_SOURCE_DIR}/server/dist ${CMAKE_BINARY_DIR}/spiffs.bin
    DEPENDS ${SERVER_OUTPUT})

add_custom_command(OUTPUT ${CMAKE_BINARY_DIR}/controller/controller.ino.bin COMMAND bash ARGS -c "arduino-cli compile --config-file ${CMAKE_SOURCE_DIR}/controller/arduino-cli.yaml --build-properties build.flash_size=2M --output-dir ${CMAKE_BINARY_DIR} --fqbn esp8266:esp8266:nodemcuv2 ${CMAKE_SOURCE_DIR}/controller" 
    DEPENDS ${CONTROLLER_FILES})

add_custom_target(controller DEPENDS ${CMAKE_BINARY_DIR}/spiffs.bin ${CMAKE_BINARY_DIR}/controller/controller.ino.bin)
add_custom_target(controller_program DEPENDS ${CMAKE_BINARY_DIR}/controller/controller.ino.bin)
#add_custom_target(server_compressed bash -c "for i in server_data/*; do tar -czf $i.gz $i; done")    

add_custom_target(flash_data esptool.py --chip esp8266 --port /dev/ttyUSB0 write_flash 0x200000 ${CMAKE_BINARY_DIR}/spiffs.bin
    DEPENDS ${CMAKE_BINARY_DIR}/spiffs.bin)

add_custom_target(deploy_web
    COMMAND npm --prefix "${CMAKE_SOURCE_DIR}/server" run build
    COMMAND rm -rf ${CMAKE_BINARY_DIR}/deploy-thermometer
    COMMAND heroku git:clone -a kulhankovi ${CMAKE_BINARY_DIR}/deploy-thermometer
    COMMAND cp ${CMAKE_BINARY_DIR}/server/dist/* -r ${CMAKE_BINARY_DIR}/deploy-thermometer/dist
    COMMAND cd ${CMAKE_BINARY_DIR}/deploy-thermometer && git add . && git commit -m "automatic update" && git push heroku master
    COMMAND rm -rf ${CMAKE_BINARY_DIR}/deploy-thermometer)

add_custom_target(flash_program
    arduino-cli compile --config-file ${CMAKE_SOURCE_DIR}/controller/arduino-cli.yaml --build-properties build.flash_size=2M --fqbn esp8266:esp8266:nodemcuv2 ${CMAKE_SOURCE_DIR}/controller
    COMMAND arduino-cli upload -p /dev/ttyUSB0 --config-file ${CMAKE_SOURCE_DIR}/controller/arduino-cli.yaml --fqbn esp8266:esp8266:nodemcuv2 ${CMAKE_SOURCE_DIR}/controller
    DEPENDS ${CONTROLLER_FILES})

add_custom_target(flash
    DEPENDS flash_data flash_program)

#add_custom_command(TARGET server POST_BUILD COMMAND rm -rf ../server/dist)


#

