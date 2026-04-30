import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GlobalProvider } from './context/GlobalContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div style={{padding: 20, color: 'red', background: 'black', height: '100vh'}}>
        <h2>Something went wrong.</h2>
        <pre>{(this.state.error as any).toString()}</pre>
        <pre>{(this.state.error as any).stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <GlobalProvider>
          <App />
        </GlobalProvider>
      </NotificationProvider>
    </ErrorBoundary>
  </StrictMode>,
);
