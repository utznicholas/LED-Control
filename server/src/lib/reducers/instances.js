import {
  RUN_TIMELINE,
  PAUSE_TIMELINE,
  RESUME_TIMELINE,
  STOP_TIMELINE,
  STOP_TIMELINE_BULK,
  setChannelStateBulk,
  stopTimelineBulk
} from '/lib/actions';

var store;
var handle;
var cnt = 0;

function colorAtTime(stops, time) {
  let from = stops[0];
  let to = stops[0];
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].offset > time) {
      from = to;
      to = stops[i];
    }
  }
  
  let pdif = Math.min((time - from.offset) / (to.offset - from.offset), 1);
  let ipdif = 1 - pdif;
  
  from = from.color;
  to = to.color;
  
  return from.map((e, i) => ((ipdif * e) + (pdif * to[i])));
}

function updateInstances(dt) {
  let state = store.getState();
  let instances = state.instances;
  if (instances.instances.length === 0) {
    clearInterval(handle);
    
  } else {
    let toStop = [];
    let states = [];
    for (let i = 0; i < instances.instances.length; i++) {
      let inst = instances[instances.instances[i]];
      let timeline = state.timelines[inst.timeline];
      if (inst.running) {
        for (let j = 0; j < timeline.channels.length && j < inst.channels.length; j++) {
          if (timeline.stops[j]) {
            states.push({
              addr: inst.channels[j],
              state: colorAtTime(timeline.stops[j], inst.progress)
            });
          }
        }
        // !!! breaking the redux model here !!!
        // not actually sure if this'll work as expected
        inst.progress += dt;
      }
    }
    
    store.dispatch(setChannelStateBulk(states));
    store.dispatch(stopTimelineBulk(toStop));
  }
}

export function setStore(str) {
  store = str;
}

export function reduce(state = {instances:[]}, action) {
  let newState;
  switch (action.type) {
    case RUN_TIMELINE :
      newState = Object.assign({}, state);
      let newInstance = {
        id: cnt++,
        progress: 0,
        running: true,
        timeline: action.timeline,
        channels: action.channels
      };
      newState[newInstance.id] = newInstance;
      newState.instances.push(newInstance.id);
      if (!handle) handle = setInterval(updateInstances, 30, 30);
      break;
    case PAUSE_TIMELINE :
      newState = Object.assign({}, state);
      newState[action.id].running = false;
      break;
    case RESUME_TIMELINE :
      newState = Object.assign({}, state);
      newState[action.id].running = true;
      break;
    case STOP_TIMELINE :
      newState = Object.assign({}, state);
      delete newState[action.id];
      newState.instances.splice(newState.instances.indexOf(action.id), 1);
      break;
    case STOP_TIMELINE_BULK :
      newState = Object.assign({}, state);
      for (let i = 0; i < state.ids.length; i++) {
        delete newState[action.ids[i]];
        newState.instances.splice(newState.instances.indexOf(action.ids[i]), 1);
      }
      break;
    default:
      return state;
  }
  
  return newState;
}
