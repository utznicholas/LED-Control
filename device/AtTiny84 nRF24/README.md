# LED Control Device - AtTiny84
### LED Control device endpoint running arduino on AtTiny84 with nRF24L01+ transceiver

The AtTiny84 Device runs ArduinoTiny on an AtTiny84. The
AtTiny84 is connected via SPI to a Nordic nRF24L01+ 2.4 GHz
transceiver. The device then broadcasts subscription packets,
looking for an nRF24 repeater (like the ESP8266 nRF24
repeater), which can connect to the LED Control Server via
TCP socket. The repeater then subscribes for control packets
relevant to the AtTiny84, and repeats relevant information
to the device.
