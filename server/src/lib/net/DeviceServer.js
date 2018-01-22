import { Server } from 'net';

import {
  SET_CHANNEL_STATE,
  SET_CHANNEL_STATE_BULK,
  UPDATE_DEVICE,
  createDevice
} from '/lib/actions';

const magicNumber = Buffer.from([0xDEAD, 0xBEEF]);

export class DeviceConnection {
  constructor(socket, store, onClose) {
    this._sock = socket;
    this._store = store;
    this._onClose = onClose;
    this._subscriptions = [];
    this._unsub = store.subscribe(this._onChange.bind(this));
    
    this._socket.on("close", this._close.bind(this));
    this._socket.on("data", this._data.bind(this));
    this._socket.on("end", this._end.bind(this));
    this._socket.on("error", this._error.bind(this));
  }
  
  _close(e) {
    console.log("[DeviceConnection] Connection closed");
    this._onClose();
  }
  
  _data(data) {
    if (data.length < 9) console.log("[DeviceConnection] Received data shorter than expected length");
    for (let i = 0; i < 4; i++) {
      if (data.readUInt8(i) != magicNumber.readUInt8(i)) {
        console.log("[DeviceConnection] Received data did not start with magic number");
        return;
      }
    }
    
    let type = data.readUInt8(4);
    let dID = data.readUInt32BE(5);
    if (type == 0x01) {
      // sub packet
      let ports = data.readUInt8(6);
      this._onSub(dID, ports)
      
    } else if (type == 0x03) {
      //unsub packet
      this._onUnSub(dID);
    }
  }
  
  _end() {
    console.log("[DeviceConnection] Connection ended");
    this._unsub();
    this._onClose();
  }
  
  _error(e) {
    this._sock.end();
    console.log("[DeviceConnection] ", e);
  }
  
  _onSub(dID, ports) {
    let state = this._store.getState();
    if (state.devices.hasOwnProperty(dID)) {
      this._subscriptions.push(dID);
      
    } else {
      this._subscriptions.push(dID);
      this._store.dispatch(createDevice(dId, ports));
    }
  }
  
  _onUnSub(dID) {
    this._subscriptions.splice(this._subscriptions.indexOf(dID), 1);
  }
  
  close() {
    console.log("[DeviceConnection] Closing connection");
    this._unsub();
    this._sock.end();
  }
  
  _onChange() {
    let state = this._store.getState();
    this._subscriptions.forEach((d) => {
      d = state.devices[d];
      let values = d.ports.map((c, i) => {
        return Math.round(state.channels[c].state[d.indices[i]] * d.tune[i]);
      });
      let packetSize = 4 + 1 + 4 + 4 + (2 * values.length);
      let buf = Buffer.allocUnsafe(packetSize);
      let ind = 0;
      for (ind = 0; ind < magicNumber.length; ind++) buf.writeUint8(magicNumber.readUInt8(ind));
      buf.writeUint8(0x02, ind++);
      buf.writeUint32(d.id, ind); ind += 4;
      buf.writeUint8(2 * values.length, ind++);
      for (let j = 0; j < values.length; j++, ind += 2) buf.writeUint16(values[j], ind);
      this._sock.write(buf);
    });
  }
}

export default class DeviceServer {
  constructor(store) {
    this._store = store;
    this._sock = new Server();
    this._connections = [];
    
    this._sock.on("close", this._close.bind(this));
    this._sock.on("connection", this._connection.bind(this));
    this._sock.on("error", this._socketError.bind(this));
  }
  
  listen(port) {
    let prm = new Promise((res, rej) => {
      let onErr = (e) => {
        rej(e);
      };
      this._sock.once("error", onErr);
      this._sock.once("listening", () => {
        this._sock.removeListener("error", onErr);
        this._sock.on("error", this._socketError);
        res();
      });
      this._sock.listen(port);
    });
  }
  
  _close() {
    this._connections.forEach((e) => {
      e.close();
    });
    this._sock.close();
    console.log("DeviceServer Server Socket closed");
  }
  
  _connection(s) {
    let conn = new DeviceConnection(s, this._store, () => {
      this._connections.splice(this._connections.indexOf(conn), 1);
    });
    this._connections.push(conn);
  }
  
  _socketError(e) {
    
  }
  
  close() {
    this._connections.forEach((c) => {
      c.close();
    });
    this._sock.close();
  }
}
