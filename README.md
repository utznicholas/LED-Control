# LED Control

LED Control is a system that uses a Node.js server as a
centralized control point to control simple RGB LED strips
or other devices over a network. Simple, 12V, common annode
LED Strips can be easily acquired for very low prices (a
5m strip with 300 LEDs is currently around $10 on amazon).

The LED Control system is designed to use similarly low
cost parts to make a centralized control system.

## LED Control Server
The LED Control Server is a Node.js server that is intended
to be run on a low-cost SBC, such as a Raspberry Pi or a
PineA64.

## Web Interface
The Web Interface is the primary interface by which users
control their LEDs. The interface allows for configuration
of control devices.

## Control Devices
Control Devices interface directly with the LEDs.
Devices are given a static, unique Device ID, by which they
identify themselves with the server. 

### Control Repeaters
Control Repeaters relay communications between the server
and devices that cannot reach the server directly.

## Logical Concepts
### Channels
A Channel is intended to represent a single controllable
'object,' such as a single LED strip. Thus, channels can
have a variable number of values in their 'state.' For
example, an RGB LED strip, could be represented as a
single Channel with 3 values in it. An RGBW strip would
be a single channel, with 4 values in it. The ability
to have a single Channel with multiple values is intended
to simplify managing large systems with many LED strips
that can be controlled independently.

A Channel is identified by its Address, but in the web
interface, Channels can also have a user-friendly name
associated with them. 

The values within a Channel's state (ie, R, G, and B)
are refered to as a Channel's indexes.

### Devices
Devices are identified by a unique Device ID. When a
device subscribes to a server, it sends its ID, and the 
number of outputs (referred to as 'ports') it has, in
the subscription request. 

Each port of a device is associated with a channel, and
channel index, by the user, through the web interface.
Because a port can have only a single value as its state,
it is necessary to assign ports both a channel address
and index, to select a single value for them.

The association of ports with channel indices is an
abstraction layer that allows for more versatile and
simple usage of devices with different port counts. For
example, two devices with 2 ports could be controleed with
a single 4-index Channel. It also allows multiple devices
to be controlled by the same Channel indexes, allowing
multiple LED strips in distinct locations to always have
the same state, despite not being physically connected
to eachother.

### Timelines
Timelines are the primary method of orchestrating Channels.
Timelines are defined with a certain number of Channels
that they control. The timeline also specifies the number
of indexes expected in each channel.

A Timeline is defined as a series of 'stops.' A stop
indicates the state of an output Channel at a specific
point in time in the timeline. 

The output Channels of a Timeline are defined when the
Timeline is run.
Timeliens can be run manually, through the web interface,
or automatically by a Schedule.
Timelines and Channel control/orchestration will become
more versatile in the future.

### Schedules
Schedules are the primary method of automating LED control.
Schedules consist of a timeline that they trigger, the
Channels to apply the timeline to, and a cron tab that
determines when the schedule is triggered.

In the future, a more flexible way of automating control
may be developed that will allow for things like 
orchestrating many timelines, and randomizing certain
components of LED control.

## Protocol
Devices connect to the control server with a very simple
protocol. This protocol is transported over TCP links,
but due to its simple design, could also be transported
with a simple Pub/Sub messaging system, like MQTT. It can
also be transported over UDP, but TCP is prefered, as it
allows the server to only send necessary data and guarantees
delivery.

All packets in the LED control protocol start with a magic
number, indicating the start of a packet. The magic number
is followed by a one byte packet type identifier, and a 4
byte device ID. For packets that are sent by the device to 
the server, the device ID is the ID of the device sending
the packet. For server-sent packets, it is the destination
device's ID.

### Packets
When a device connects to the server, it issues a 
Subscribe packet.

#### Sub packet
| Packet Start | Packet Type | Device ID | Port Count |
|:------------:|:-----------:|:---------:|:----------:|
|  0xDEADBEEF  | 0x01        | uint32    | uint8      |

The port count is included in the subscribe packet to simplify
the process of adding new devices to a server. Instead of 
devices looking for servers that they already know, finding
one they don't know, and then adding themselves to it, if
an unknown device subscribes to a server, the server simply
adds it as a new device, and waits for a user to configure 
its port assignments.

When the server receives a subscribe packet on a TCP socket,
it makes an association between that socket connection and
the Channels that the subscribing Device is associated with.

When the state of a Channel that a Device is linked to changes,
the server sends the connected Device a Publish packet.

#### Pub packet
| Packet Start | Packet Type | Device ID | Payload Size | Port N state... |
|:------------:|:-----------:|:---------:|:------------:|:---------------:|
|  0xDEADBEEF  | 0x02        | uint32    | uint8       | uint16...       |

The Payload Size of the Pub packet is measured in bytes,
thus imposing a limit of 128 ports per device. The state
of a port is sent as a uint16, allowing for upto 65536
discrete states. It is up to the device to convert this
value into a form that it can use (ie, a device with
10-bit PWM resolution would need to convert the state
to a value between 0 and 1024).

The Device ID is included in the Pub packet to allow
Repeaters to relay information destined for multiple
devices.

It is up to the user to know the order of the ports on
a device when they assign each port to a channel index.

#### Unsub packet
| Packet Start | Packet Type | Device ID |
|:------------:|:-----------:|:---------:|
|  0xDEADBEEF  | 0x03        | uint32    |

The unsub packet is sent by a device that wishes to stop
receiving data related to some device ID.

Most devices do not need to send an Unsub packet.
Subscriptions are an association between a device and
a TCP socket. When the socket closes, the subscription
is ended.

The most common usecase for Unsub is in Repeaters. If
a device that data is being repeated to disconnects from
the repeater, then the repeater can unsubscribe from
that device's ID.
It is not required that a repeater unsubscribes from a 
disconnected device's ID.

### Repeaters and Virtual Devices
Repeaters are used to connect devices without TCP networking
capabilities to a server. An example is the ESP8266 nRF24
repeater. This repeater uses the networking capabilities of
an ESP8266 to connect nRF24 enabled devices to a server.

Repeaters are mainly used to bridge different types of
networks, as in the ESP8266 nRF24 example.

Repeaters can be physical devices, such as an ESP8266, or
virtual constructs. For example, if a server was running on
a Raspberry Pi, there could be a Python progam running on
the same device, using the Pi's SPI interface to communicate
directly with an nRF24L01+, instead of sending data through
the network to a nearby ESP8266.

Virtual Devices are similar to Repeaters that have subscribed
to multiple device publications.
Virtual Devices refer to devices without a unique physical
representation. An example would be a micocontroller with
many PWM outputs, or even PWM expanders. Instead of subscribing
as a single deviec with many ports, it could group the ports
into multiple virtual devices.
