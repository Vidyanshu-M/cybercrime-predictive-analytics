import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Auto-purge stale mock session keys to ensure live PostgreSQL backend data loads
if (localStorage.getItem('cybertrace_jwt_token')?.includes('mock_')) {
  localStorage.removeItem('cybertrace_jwt_token');
}
if (localStorage.getItem('cybertrace_use_mock') === 'true') {
  localStorage.removeItem('cybertrace_use_mock');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

