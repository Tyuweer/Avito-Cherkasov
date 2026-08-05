// src/app/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './providers/StoreProvider';

import { Layout } from '../widgets/header/Layout';
import { HomePage } from '../pages/home-page/HomePage';
import { ProfilePage } from '../pages/profile-page/ProfilePage';
import { ExchangePage } from '../pages/exchange-page/ExchangePage';
import { ItemPage } from '../pages/item-page/ItemPage';

const AppContent = () => {
  const store = useStore();

  useEffect(() => {
    store.fetchCurrentUser();
  }, [store]);

  if (store.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        Загрузка...
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/exchange/:dealId" element={<ExchangePage />} />
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;