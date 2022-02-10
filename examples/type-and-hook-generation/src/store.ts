import { Action, applyMiddleware, combineReducers, createStore, Store } from "redux";
import thunkMiddleware from "redux-thunk";
import { configure, reducer, State } from "react-api-data";
import { useMemo } from "react";
import { endpointConfig } from "./endpointConfig";

let store: Store<{
  apiData: State;
}, Action>;

export const initStore = () => {
  store = createStore(
    combineReducers({ apiData: reducer }),
    {},
    applyMiddleware(thunkMiddleware),
  );
  store.dispatch(configure({}, endpointConfig));
  return store;
}

export const useStore = () => {
  return useMemo(() => store ?? initStore(), []);
}
