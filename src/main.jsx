import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { NotificationsProvider } from './notifications/NotificationsProvider';
import './styles/global.css';
import './styles/advanced.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NotificationsProvider>
  </React.StrictMode>
);
