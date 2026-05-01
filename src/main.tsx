import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GlobalProvider } from './context/GlobalContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) {
    const isChunkError = error.message.includes('Failed to fetch dynamically imported module') || 
                         error.name === 'TypeError' && error.message.includes('import');
    if (isChunkError) {
      const lastReload = localStorage.getItem('aria_last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        localStorage.setItem('aria_last_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 40, 
          color: '#ff4444', 
          background: '#0b0d1c', 
          height: '100vh', 
          fontFamily: 'Lexend, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 20 }}>MISSION CRITICAL ERROR</h2>
          <p style={{ maxWidth: 600, color: '#888', marginBottom: 40 }}>The interface encountered a neural link failure. We are attempting to re-establish the connection.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#7c3aed',
              color: 'white',
              padding: '16px 32px',
              border: '4px solid black',
              fontWeight: 900,
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
            }}
          >
            Re-Synchronize Interface
          </button>
          <pre style={{ marginTop: 60, fontSize: '10px', opacity: 0.3, maxWidth: '80vw', overflow: 'hidden' }}>
            {(this.state.error as any).toString()}
          </pre>
        </div>
      );
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
