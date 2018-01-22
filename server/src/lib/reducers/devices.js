import {
  LOADED_DEVICE,
  CREATE_DEVICE,
  UPDATE_DEVICE,
  DELETE_DEVICE
} from '/lib/actions';

export default function reduce(state = {devices: []}, action) {
  let newState;
  switch (action.type) {
    case UPDATE_DEVICE :
      newState = Object.assign({}, state);
      let device = newState[action.id];
      device.name = action.name;
      device.ports = action.ports;
      return newState;
    case LOADED_DEVICE :
    case CREATE_DEVICE :
      newState = Object.assign({}, state);
      let newDevice = {
        id: action.id,
        name: action.name,
        ports: action.ports
      };
      newState[newDevice.id] = newDevice;
      newState.devices.push(newDevice.id);
      return newState;
    case DELETE_DEVICE :
      newState = Object.assign({}, state);
      delete newState[action.id];
      newState.devices.splice(newState.devices.indexOf(action.id), 1);
      break;
    default : 
      return state;
  }
}