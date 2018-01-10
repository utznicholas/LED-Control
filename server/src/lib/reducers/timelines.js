import {
  LOADED_TIMELINE,
  CREATE_TIMELINE,
  UPDATE_TIMELINE,
  DELETE_TIMELINE
} from '/lib/actions';

export default function reduce(state = {timelines:[]}, action) {
  let newState;
  switch (action.type) {
    case LOADED_TIMELINE :
    case CREATE_TIMELINE :
      newState = Object.assign({}, state, {
        [action.id]: {
          id: action.id,
          name: action.name,
          duration: action.duration,
          channels: action.channels,
          stops: action.stops
        }
      });
      newState.timelines.push(action.id);
      break;
    case UPDATE_TIMELINE :
      newState = Object.assign({}, state, {
        [action.id]: {
          id: action.id,
          name: action.name,
          duration: action.duration,
          channels: action.channels,
          stops: action.stops
        }
      });
      break;
    case DELETE_TIMELINE :
      newState = Object.assign({}, state);
      delete newState[action.id];
      newState.timelines.splice(newState.timelines.indexOf(action.id), 1);
      break;
    default :
      return state;
  }
  
  return newState;
}