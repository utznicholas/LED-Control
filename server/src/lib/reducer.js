/*
 * The reducer.js file defines the root reducer
 * of the application. 
 */
import * as Actions from '/lib/actions';

import * as Devices from '/lib/reducers/devices';
import * as Channels from '/lib/reducers/channels';
import * as Colors from '/lib/reducers/colors';
import * as Timelines from '/lib/reducers/timelines';
import * as Schedules from '/lib/reducers/schedules';
import * as Instances from '/lib/reducers/instances';

import EventEmitter from 'events';

export function setStore(str) {
  Schedules.setStore(str);
  Instances.setStore(str);
}

export default class Reducer extends EventEmitter {
  constructor() {
    
  }
  
  reduce(state = {}, action = {}) {
    let newState;
    if (action.type == Actions.BATCH_ACTION) {
      newState = Object.assign({}, state, {
        lastAction: Actions.BATCH_ACTION
      });
      let actions = action.actions;
      for (let i = 0; i < actions.length; i++) {
        let act = actions[i];
        newState = {
          devices: Devices.reduce(state.devices, act),
          channels: Channels.reduce(state.channels, act),
          colors: Colors.reduce(state.colors, act),
          timelines: Timelines.reduce(state.timelines, act),
          schedules: Schedules.reduce(state.schedules, act),
          instances: Instances.reduce(state.instances, act)
        };
      }

    } else {
      newState = {
        lastAction: action.type,
        devices: Devices.reduce(state.devices, action),
        channels: Channels.reduce(state.channels, action),
        colors: Colors.reduce(state.colors, action),
        timelines: Timelines.reduce(state.timelines, action),
        schedules: Schedules.reduce(state.schedules, action),
        instances: Instances.reduce(state.instances, action)
      };
    }
    
    setImmediate(() => {
      this.emit("action", action);
      this.emit(action.type, action);
    });
    
    return newState;
  }
}
