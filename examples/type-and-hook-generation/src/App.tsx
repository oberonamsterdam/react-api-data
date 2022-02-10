import './App.css';
import { initStore } from './store';
import { Provider } from 'react-redux';
import Article from './Article';

const store = initStore();

const App = () => {
  return (
    <Provider store={store}>
      <Article articleId={12}/>
    </Provider>
  );
}

export default App;
