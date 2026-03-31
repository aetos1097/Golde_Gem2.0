import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const openLogin = () => { setShowRegister(false); setShowLogin(true); };
  const openRegister = () => { setShowLogin(false); setShowRegister(true); };
  const closeModals = () => { setShowLogin(false); setShowRegister(false); };

  return (
    <>
      <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage onLoginClick={openLogin} />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
      </Routes>

      <Footer />

      {showLogin && (
        <LoginModal onClose={closeModals} onSwitchToRegister={openRegister} />
      )}
      {showRegister && (
        <RegisterModal onClose={closeModals} onSwitchToLogin={openLogin} />
      )}
    </>
  );
}
