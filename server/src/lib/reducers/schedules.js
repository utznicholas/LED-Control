import * as Cron from 'node-cron';
import {
  LOADED_SCHEDULE,
  CREATE_SCHEDULE,
  UPDATE_SCHEDULE,
  DELETE_SCHEDULE,
  runTimeline
} from '/lib/actions';

var store;

export function setStore(str) {
  store = str;
}

export default function reduce(state = {schedules: []}, action) {
  let newState;
  switch (action.type) {
    case LOADED_SCHEDULE :
    case CREATE_SCHEDULE :
      newState = Object.assign({}, state);
      let newSched = {
        id: action.id,
        name: action.name,
        tab: action.tab,
        timeline: action.timeline,
        enabled: action.enabled,
        channels: action.channels
      };
      newSched.task = Cron.schedule(action.tab, (() => {
        store.dispatch(runTimeline(this.timeline, this.channels));
      }).bind(newSched), newSched.enabled);
      newState[newSched.id] = newSched;
      newState.schedules.push(newSched.id);
      break;
    case UPDATE_SCHEDULE :
      newState = Object.assign({}, state);
      let sched = newState[action.id];
      sched.name = action.name;
      sched.timeline = action.timeline;
      sched.channels = action.channels;
      if (sched.tab != action.tab) {
        sched.tab = action.tab;
        sched.enabled = action.enabled;
        sched.task.destroy();
        sched.task = Cron.schedule(sched.tab, (() => {
          store.dispatch(runTimeline(this.timeline, this.channels));
        }).bind(sched), sched.enabled);
        
      } else if (sched.enabled != action.enabled) {
        sched.enabled = action.enabled;
        if (sched.enabled) {
          sched.task.start();
          
        } else {
          sched.task.stop();
        }
      }
      sched.enabled = action.enabled;
      
      break;
    case DELETE_SCHEDULE :
      newState = Object.assign({}, state);
      let sched1 = newState[action.id];
      sched1.task.destroy();
      delete newState[action.id];
      newState.schedules.splice(newState.schedules.indexOf(action.id), 1);
      break;
    default :
      return state;
  }
  
  return newState;
}