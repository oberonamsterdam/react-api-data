import { Provider } from "react-redux";
import { initializeStore, useStore } from "../store";
import { getDataFromTree } from "react-api-data";

const App = ({ Component, initialReduxState, ...pageProps }) => {
  const store = useStore(initialReduxState);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

App.getInitialProps = async ({ Component, ...rest }) => {
  const store = initializeStore();

  await getDataFromTree(
    <Provider store={store}>
      <Component />
    </Provider>,
    store
  );
  return { initialReduxState: store.getState(), store };
};

export default App;
