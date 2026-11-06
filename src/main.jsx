import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './auth';
import { StoreProvider } from './store';
import App from './App';
import LoginScreen from './components/LoginScreen';
import './App.css';

function Root() {
  const { user } = useAuth();

  if (!user) return <LoginScreen />;

  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
