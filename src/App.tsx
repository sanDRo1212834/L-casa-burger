import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Header';
import { CustomerView } from './views/CustomerView';
import { AdminView } from './views/AdminView';
import { LoginView } from './views/LoginView';
import { PWAPrompt } from './components/PWAPrompt';

function AppContent() {
  const { view } = useAppContext();

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-red-500 selection:text-white">
      <Header />
      <PWAPrompt />
      <main>
        {view === 'customer' && <CustomerView />}
        {view === 'admin' && <AdminView />}
        {view === 'login' && <LoginView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

