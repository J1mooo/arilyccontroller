import React from 'react';
import ReactDOM from 'react-dom/client';
import ArylicControllerApp from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ArylicControllerApp />
  </React.StrictMode>
);