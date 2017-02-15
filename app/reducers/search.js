import { SEARCH_RESULT } from '../actions'

const initialState = [];

export default function searchReducer(state = initialState, action){
  switch (action.type) {
    case SEARCH_RESULT:
      return action.result;
    default:
      return state;
  }
}