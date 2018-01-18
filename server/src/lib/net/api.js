import * as Actions from '/lib/actions';
import Express from 'express';

const RelayActions = [
  Actions.LOADED_DEVICE,   Actions.CREATE_DEVICE,   Actions.UPDATE_DEVICE,   Actions.DELETE_DEVICE,
  Actions.LOADED_CHANNEL,  Actions.CREATE_CHANNEL,  Actions.UPDATE_CHANNEL,  Actions.DELETE_CHANNEL,
  Actions.LOADED_COLOR,    Actions.CREATE_COLOR,    Actions.UPDATE_COLOR,    Actions.DELETE_COLOR,
  Actions.LOADED_TIMELINE, Actions.CREATE_TIMELINE, Actions.UPDATE_TIMELINE, Actions.DELETE_TIMELINE,
  Actions.LOADED_SCHEDULE, Actions.CREATE_SCHEDULE, Actions.UPDATE_SCHEDULE, Actions.DELETE_SCHEDULE
];

export default class WebApi {
  constructor(express, stor, reducer) {
    this._app = express;
    this._store = stor;
    
    this._connections = [];
    this._app.ws("/api", this._onConnection.bind(this));
    
    reducer.on("action", this._onAction.bind(this));
  }
  
  _onConnection(ws, req) {
    console.log("[WS API] New WS connection");
    this._connections.push(ws);
    // setup event listeners
    ws.on("message", this._onMessage.bind(this));
    ws.on("close", () => {
      console.log("[WS API] WS API connection closed");
      this._connections.splice(this._connections.indexOf(ws), 1);
    });
    
    // send current state
    let state = this._store.getState();
    
    let batch = new Actions.BatchAction();
    state.devices.devices.forEach((id) => {
      let d = state.devices[id];
      batch.append(Actions.loadedDevice(d.id, d.name, d.ports, d.indices, d.tune));
    });
    ws.send(JSON.stringify({
      type: "action",
      action: batch
    }));
    
    batch = new Actions.BatchAction();
    state.channels.channels.forEach((addr) => {
      let c = state.channels[addr];
      batch.append(Actions.loadedChannel(addr, c.name, c.size));
    });
    ws.send(JSON.stringify({
      type: "action",
      action: batch
    }));
    
    batch = new Actions.BatchAction();
    state.colors.colors.forEach((id) => {
      let c = state.colors[id];
      batch.append(Actions.loadedColor(id, c.name, c.color));
    });
    ws.send(JSON.stringify({
      type: "action",
      action: batch
    }));
    
    batch = new Actions.BatchAction();
    state.timelines.timelines.forEach((id) => {
      let tl = state.timelines[id];
      batch.append(Actions.loadedTimeline(id, tl.name, tl.duration, tl.channels, tl.stops));
    });
    ws.send(JSON.stringify({
      type: "action",
      action: batch
    }));
    
    batch = new Actions.BatchAction();
    state.schedules.schedules.forEach((id) => {
      let s = state.schedules[id];
      batch.append(Actions.loadedSchedule(id, s.name, s.tab, s.timeline, s.channels, s.enabled));
    });
    ws.send(JSON.stringify({
      type: "action",
      action: batch
    }));
  }
  
  _onAction(action) {
    if (RelayActions.includes(action.type)) {
      this._sendAction(action);
    }
  }
  
  _sendAction(action) {
    let message = JSON.stringify({
      type: "action",
      action: action
    });
    this._connections.forEach((e) => {
      e.send(message);
    });
  }
  
  _onMessage(message) {
    let m = JSON.parse(message.data);
    if (m.type == "action") {
      console.log("[WS API] Received Action from WS client");
      this._store.dispatch(m.action);
    }
  }
}
