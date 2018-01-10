# ESP8266 nRF24L01+ Repeater
### LED Control repeater/hub running Arduino Core on ESP8266

The ESP8266 nRF24L01+ Repeater uses the networking capabilities
of the ESP8266 to connect nRF24L01+ devices to the LED Control
Server. The Repeater listens for nRF24L01+ devices subscribing
to the server, and relays their request to the server via WiFi.
The Repeater then acts as a 'virtual device' and relays control
signals received via WiFi to the nRF24L01+ device.
