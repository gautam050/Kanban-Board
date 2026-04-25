import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { App } from './app/App';
import './styles/global.css';

const theme = localStorage.getItem('kanban-theme') || 'light';
document.documentElement.dataset.theme = theme;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
