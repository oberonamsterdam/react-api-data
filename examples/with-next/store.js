import { applyMiddleware, combineReducers, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import { configureApiData, reducer } from "react-api-data";
import { useMemo } from "react";

let store;

const endpointConfig = {
  getArticle: {
    url: "http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId/:userId",
    method: "GET"
  }
};

function initStore(initialState) {
  const store = createStore(
    combineReducers({ apiData: reducer }),
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware))
  );
  store.dispatch(configureApiData({}, endpointConfig));
  return store;
}

export const initializeStore = preloadedState => {
  let _store = store ?? initStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState
    });
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [initialState]);
  return store;
}
