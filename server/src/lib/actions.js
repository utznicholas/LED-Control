var nSQL;
var store;

// sets the nSQL database to persist state to
export function setDatabase(db) {
  nSQL = db;
}

// sets the Redux Store storing the application state
export function setStore(str) {
  store = str;
}

/* Synchronous actions */
export const SET_CHANNEL_STATE = "SET_CHANNEL_STATE";
export function setChannelState(addr, state) {
  return {
    type: SET_CHANNEL_COLOR,
    addr: addr,
    state: state
  };
}

export const SET_CHANNEL_STATE_BULK = "SET_CHANNEL_STATE_BULK";
export function setChannelStateBulk(channelStates) {
  return {
    type: SET_CHANNEL_COLOR_BULK,
    channelStates: channelStates
  };
}

export const RUN_TIMELINE = "RUN_TIMELINE";
export function runTimeline(timeline, channels) {
  return {
    type: RUN_TIMELINE,
    timeline: timeline,
    channels: channels
  };
}

export const PAUSE_TIMELINE = "PAUSE_TIMELINE";
export function pauseTimeline(instance) {
  return {
    type: PAUSE_TIMELINE,
    id: instance
  };
}

export const RESUME_TIMELINE = "RESUME_TIMELINE";
export function resumeTimeline(instance) {
  return {
    type: RESUME_TIMELINE,
    id: instance
  };
}

export const STOP_TIMELINE = "STOP_TIMELINE";
export function stopTimeline(instance) {
  return {
    type: STOP_TIMELINE,
    id: instance
  };
}

export const STOP_TIMELINE_BULK = "STOP_TIMELINE_BULK";
export function stopTimelineBulk(instances) {
  return {
    type: STOP_TIMELINE_BULK,
    ids: instances
  };
}

export const LOADED_DEVICE = "LOADED_DEVICE";
export function loadedDevice(id, name, ports, indices, tune) {
  return {
    type: LOADED_DEVICE,
    id: id,
    name: name,
    ports: ports,
    indices: indices,
    tune: tune
  };
}

export const LOADED_CHANNEL = "LOADED_CHANNEL";
export function loadedChannel(addr, name, size) {
  return {
    type: LOADED_CHANNEL,
    addr: addr,
    name: name,
    size: size
  };
}

export const LOADED_COLOR = "LOADED_COLOR";
export function loadedColor(id, name, color) {
  return {
    type: LOADED_COLOR,
    id: id,
    name: name,
    color: color
  };
}

export const LOADED_TIMELINE = "LOADED_TIMELINE";
export function loadedTimeline(id, name, duration, channels, stops) {
  return {
    type: LOADED_TIMELINE,
    id: id,
    name: name,
    duration: duration,
    channels: channels,
    stops: stops
  };
}

export const LOADED_SCHEDULE = "LOADED_SCHEDULE";
export function loadedSchedule(id, name, tab, timeline, channels, enabled) {
  return {
    type: LOADED_SCHEDULE,
    id: id,
    name: name,
    tab: tab,
    timeline: timeline,
    channels: channels,
    enabled: enabled
  };
}

export const BATCH_ACTION = "BATCH_ACTION";
export class BatchAction {
  constructor() {
    this.actions = [];
  }
  
  append(action) {
    if (typeof action == "object" && action.hasOwnProperty("type")) {
      this.actions.push(action);
    }
  }
  
  get type() {
    return BATCH_ACTION;
  }
  
  get actions() {
    return this.actions;
  }
}

/* Asynchronous Actions (thunks) */

// device actions
export const CREATE_DEVICE = "CREATE_DEVICE";
function deviceCreated(id, name, ports, indices, tune) {
  return {
    type: CREATE_DEVICE,
    id: id,
    name: name,
    ports: ports,
    indices: indices,
    tune: tune
  };
}
export function createDevice(id, name, ports, indices, tune) {
  return function(dispatch) {
    name = name || `New Device (${id})`;
    indices = indices || Array(ports.length).fill(0);
    tune = tune || Array(ports.length).fill(65535);
    nSQL("device").query("upsert", {
      id: id,
      name: name,
      ports: ports,
      indices: indices,
      tune: tune
    }).exec().then(() => {
      dispatch(deviceCreated(id, name, ports, indices, tune));
    });
  };
}

export const UPDATE_DEVICE = "UPDATE_DEVICE";
function deviceUpdated(id, name, ports, indices, tune) {
  return {
    type: UPDATE_DEVICE,
    id: id,
    name: name,
    ports: ports,
    indices: indices,
    tune: tune
  };
}
export function updateDevice(id, name, ports, indices, tune) {
  return function(dispatch) {
    let prev = store.getState().devices[id];
    name = name || prev.name;
    ports = ports || prev.ports;
    indices = indices || prev.indices;
    tune = tune || prev.tune;
    nSQL("device").query("upsert", {
      id: id,
      name: name,
      ports: ports,
      indices: indices,
      tune: tune
    }).exec().then(() => {
      dispatch(deviceUpdated(id, name, ports, indices, tune));
    });
  };
}

export const DELETE_DEVICE = "DELETE_DEVICE";
function deviceDeleted(id) {
  return {
    type: DELETE_DEVICE,
    id: id
  };
}
export function deleteDevice(id) {
  return function(dispatch) {
    nSQL("device").query("delete")
      .where(["id", "=", id])
      .exec().then(() => {
        dispatch(deviceDeleted(id));
      }
    );
  }
}

// channel actions
export const CREATE_CHANNEL = "CREATE_CHANNEL";
function channelCreated(addr, name, size) {
  return {
    type: CREATE_CHANNEL,
    addr: addr,
    name: name,
    size: size
  };
}
export function createChannel(addr, name, size) {
  return function(dispatch) {
    size = size || 1;
    nSQL("channel").query("upsert", {
      addr: addr,
      name: name,
      size: size
    }).exec().then(() => {
      dispatch(channelCreated(addr, name, size));
    });
  };
}

export const UPDATE_CHANNEL = "UPDATE_CHANNEL";
function channelUpdated(addr, name, size) {
  return {
    type: UPDATE_CHANNEL,
    name: name,
    size: size
  };
}
export function udateChannel(addr, name, size) {
  return function(dispatch) {
    let prev = store.getState().channels[addr];
    name = name || prev.name;
    size = size || prev.size;
    nSQL("channel").query("upsert", {
      addr: addr,
      name: name,
      size: size
    }).exec().then(() => {
      dispatch(channelUpdated(addr, name, size));
    });
  };
}

export const DELETE_CHANNEL = "DELETE_CHANNEL";
function channelDeleted(addr) {
  return {
    type: DELETE_CHANNEL,
    addr: addr
  };
}
export function deleteChannel(addr) {
  return function(dispatch) {
    nSQL("channel").query("delete")
      .where(["addr", "=", addr])
      .exec().then(() => {
        dispatch(channelDeleted(addr));
      }
    );
  }
}

// color actions
export const CREATE_COLOR = "CREATE_COLOR";
function colorCreated(id, name, color) {
  return {
    type: CREATE_COLOR,
    id: id,
    name: name,
    color: color
  };
}
export function createColor(name, color) {
  return function(dispatch) {
    nSQL("color").query("upsert", {
      name: name,
      color: color
    }).exec().then((res) => {
      dispatch(colorCreated(res.affectedRowPKS[0], name, color));
    });
  }
}

export const UPDATE_COLOR = "UPDATE_COLOR";
function colorUpdated(id, name, color) {
  return {
    type: UPDATE_COLOR,
    id: id,
    name: name,
    color: color
  };
}
export function updateColor(id, name, color) {
  return function(dispatch) {
    let prev = store.getState().colors[id];
    name = name || prev.name;
    color = color || prev.color;
    nSQL("color").query("upsert", {
      id: id,
      name: name,
      color: color
    }).exec().then((res) => {
      dispatch(colorUpdated(id, name, color));
    });
  }
}

export const DELETE_COLOR = "DELETE_COLOR";
function colorDeleted(id) {
  return {
    type: DELETE_COLOR,
    id: id
  };
}
export function deleteColor(id) {
  return function(dispatch) {
    nSQL("color").query("delete")
      .where(["id","=",id])
      .exec().then(() => {
        dispatch(colorDeleted(id));
      }
    );
  }
}

// timeline actions
export const CREATE_TIMELINE = "CREATE_TIMELINE";
function timelineCreated(id, name, duration, channels, stops) {
  return {
    type: CREATE_TIMELINE,
    id: id,
    name: name,
    duration: duration,
    channels: channels,
    stops: stops
  };
}
export function createTimeline(name, duration, channels) {
  return function(dispatch) {
    duration = duration || 10000;
    channels = channels || [];
    let stops =  {};
    nSQL("timeline").query("upsert", {
      name: name,
      duration: duration,
      channels: channels,
      stops: JSON.stringify(stops)
    }).exec().then((res) => {
      dispatch(timelineCreated(res.affectedRowsPKS[0], name, duration, channels, stops));
    });
  }
}

export const UPDATE_TIMELINE = "UPDATE_TIMELINE";
function timelineUpdated(id, name, duration, channels, stops) {
  return {
    type: UPDATE_TIMELINE,
    id: id,
    name: name,
    duration: duration,
    channels: channels,
    stops: stops
  };
}
export function updateTimeline(id, name, duration, channels, stops) {
  return function(dispatch) {
    let prev = store.getState().timelines[id];
    name = name || prev.name;
    duration = duration || prev.duration;
    channels = channels || prev.channels;
    stops = stops || prev.stops;
    
    let allStops = [];
    for (let k in stops) {
      if (stops.hasOwnProperty(k)) {
        if (k < channels.length) {
          let list = stops[k];
          for (let i = 0; i < list.length; i++) {
            allStops.push({
              target: k,
              offset: list[i].offset,
              color: list[i].color
            });
          }
        }
      }
    }
    
    nSQL("timeline").query("upsert", {
      id: id,
      name: name,
      duration: duration,
      channels: channels,
      stops: JSON.stringify({stops: allStops})
    }).exec().then(() => {
      dispatch(timelineUpdated(id, name, duration, channels, stops));
    });
  };
}

export const DELETE_TIMELINE = "DELETE_TIMELINE";
function timelineDeleted(id) {
  return {
    type: DELETE_TIMELINE,
    id: id
  };
}
export function deleteTimeline(id) {
  return function(dispatch) {
    nSQL("stops").query("delete")
      .where(["timeline", "=", id])
      .exec().then(() => {
        dispatch(timelineDeleted(id));
      }
    );
  }
}

// schedule actions
export const CREATE_SCHEDULE = "CREATE_SCHEDULE";
function scheduleCreated(id, name, tab, timeline, enabled, channels) {
  return {
    type: CREATE_SCHEDULE,
    id: id,
    name: name,
    tab: tab,
    timeline: timeline,
    enabled: enabled,
    channels: channels
  };
}
function createSchedule(name, tab, timeline, enabled, channels) {
  return function(dispatch) {
    nSQL("schedule").query("upsert", {
      name: name,
      tab: tab,
      timeline: timeline,
      enabled: enabled,
      channels: channels
    }).exec().then((res) => {
      dispatch(scheduleCreated(res.affectedRowsPKS[0], name, tab, timeline, enabled, channels));
    });
  }
}

export const UPDATE_SCHEDULE = "UPDATE_SCHEDULE";
function scheduleUpdated(id, name, tab, timeline, enabled, channels) {
  return {
    type: UPDATE_SCHEDULE,
    id: id,
    name: name,
    tab: tab,
    timeline: timeline,
    enabled: enabled,
    channels: channels
  };
}
export function updateSchedule(id, name, tab, timeline, enabled, channels) {
  return function(dispatch) {
    let prev = store.getState().schedules[id];
    let newSchedule = {
      id: id,
      name: name || prev.name,
      tab: tab || prev.tab,
      timeline: timeline || prev.timeline,
      enabled: enabled || prev.enabled,
      channels: channels || prev.channels
    };
    nSQL("schedules")
      .query("upsert", newSchedule)
      .exec().then(() => {
        dispatch(scheduleUpdated(
          newSchedule.id,
          newSchedule.name,
          newSchedule.tab,
          newSchedule.timeline,
          newSchedule.enabled,
          newSchedule.channels
        ));
      }
    );
  }
}

export const DELETE_SCHEDULE= "DELETE_SCHEDULE";
function scheduleDeleted(id) {
  return {
    type: DELETE_SCHEDULE,
    id: id
  };
}
export function deleteSchedule(id) {
  return function(dispatch) {
    nSQL("schedule").query("delete")
      .where("id", "=", id)
      .exec().then(() => {
        dispatch(scheduleDeleted(id));
      }
    );
  }
}