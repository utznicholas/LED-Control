import {
  LOADED_COLOR,
  CREATE_COLOR,
  UPDATE_COLOR,
  DELETE_COLOR
} from '/lib/actions';

export default function reduce(state = {colors: []}, action) {
  let newState;
  switch (action.type) {
    case UPDATE_COLOR :
      newState = Object.assign({}, state);
      let color = newState[action.id];
      color.name = action.name;
      color.color = action.color;
      return newState;
    case LOADED_COLOR :
    case CREATE_COLOR :
      newState = Object.assign({}, state);
      let newColor = {
        id: action.id,
        name: action.name,
        color: action.color
      };
      newState[newColor.id] = newColor;
      newState.colors.push(newColor.id);
      return newState;
    case DELETE_COLOR :
      newState = Object.assign({}, state);
      delete newState[action.id];
      newState.colors.splice(newState.colors.indexOf(action.id), 1);
      return newState;
    default:
      return state;
  }
}
