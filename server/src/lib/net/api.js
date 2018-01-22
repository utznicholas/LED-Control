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
      
    } else if (m.type == "thunk") {
      let thunk = m.thunk;
      console.log("[WS API] Received Thunk from WS client");
      switch (thunk.type) {
        case Actions.UPDATE_DEVICE: this._store.dispatch(Actions.updateDevice(thunk.id, thunk.name, thunk.ports)); break;
        case Actions.DELETE_DEVICE: this._store.dispatch(Actions.deleteDevice(thunk.id)); break;
        case Actions.UPDATE_CHANNEL: this._store.dispatch(Actions.updateChannel(thunk.addr, thunk.name, thunk.size)); break;
        case Actions.DELETE_CHANNEL: this._store.dispatch(Actions.deleteChannel(thunk.addr)); break;
        case Actions.CREATE_COLOR: this._store.dispatch(Actions.createColor(thunk.name, thunk.color)); break;
        case Actions.UPDATE_COLOR: this._store.dispatch(Actions.updateColor(thunk.id, thunk.name, thunk.color)); break;
        case Actions.DELETE_COLOR: this._store.dispatch(Actions.deleteColor(thunk.id)); break;
        case Actions.CREATE_TIMELINE: this._store.dispatch(Actions.createTimeline(thunk.name, thunk.duration, thunk.channels)); break;
        case Actions.UPDATE_TIMELINE: this._store.dispatch(Actions.updateTimeline(thunk.id, thunk.name, thunk.duration, thunk.channels, thunk.stops)); break;
        case Actions.DELETE_TIMELINE: this._store.dispatch(Actions.deleteTimeline(thunk.id)); break;
        case Actions.CREATE_SCHEDULE: this._store.dispatch(Actions.createSchedule(thunk.name, thunk.tab, thunk.timeline, thunk.enabled, thunk.channels)); break;
        case Actions.UPDATE_SCHEDULE: this._store.dispatch(Actions.updateSchedule(thunk.id, thunk.name, thunk.tab, thunk.timeline, thunk.enabled, thunk.channels)); break;
        case Actions.DELETE_SCHEDULE: this._store.dispatch(Actions.deleteSchedule(thunk.id)); break;
        default: console.log("[WS API] Unrecognized thunk type: ", thunk.type);
      }
    }
  }
}
