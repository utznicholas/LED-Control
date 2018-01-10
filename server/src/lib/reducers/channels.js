import {
  SET_CHANNEL_STATE,
  SET_CHANNEL_STATE_BULK,
  LOADED_CHANNEL,
  CREATE_CHANNEL,
  UPDATE_CHANNEL,
  DELETE_CHANNEL
} from '/lib/actions';

export default function reduce(state = {channels: []}, action) {
  let newState = Object.assign({}, state);
  switch (action.type) {
    case SET_CHANNEL_STATE : 
      if (newState[action.addr]) {
        let channel = newState[action.addr];
        for (let i = 0; i < action.state.length && i < channel.size; i++) {
          channel.state[i] = action.state[i];
        }
        
      } else {
        return state;
      }
      
      break;
    case SET_CHANNEL_STATE_BULK : 
      for (let i = 0; i < action.channelStates.length; i++) {
        let cs = action.channelStates[i];
        if (newState[cs.addr]) {
          let channel = newState[cs.addr];
          for (let j = 0; j < cs.state.length && j < channel.size; j++) {
            channel.state[j] = cs.state[j];
          }
        }
      }
      
      break;
    case LOADED_CHANNEL :
    case CREATE_CHANNEL :
      let newChannel = {
        addr: action.addr,
        name: action.name,
        size: action.size
      };
      newState[newChannel.addr] = newChannel;
      newState.chnnels.push(newChannel.addr);
      break;
    case DELETE_CHANNEL :
      delete newState[action.addr];
      newState.channels.splice(newState.channels.indexOf(action.addr));
      break;
    default :
      return state;
  }
  
  return newState;
}