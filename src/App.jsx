import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ChatPage from './pages/ChatPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import RolesPage from './pages/admin/RolesPage';
import ModulesPage from './pages/admin/ModulesPage';
import FormsPage from './pages/admin/FormsPage';
import ActionsPage from './pages/admin/ActionsPage';
import DocumentTypesPage from './pages/admin/DocumentTypesPage';
import RegionsPage from './pages/admin/RegionsPage';
import ContactsPage from './pages/admin/ContactsPage';
import ProfilePage from './pages/ProfilePage';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const location = useLocation();

  const openLogin = () => { setShowRegister(false); setShowLogin(true); };
  const openRegister = () => { setShowLogin(false); setShowRegister(true); };
  const closeModals = () => { setShowLogin(false); setShowRegister(false); };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage onLoginClick={openLogin} />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/mi-empresa" element={<CompanyDashboardPage />} />
        <Route path="/mis-ordenes" element={<OrdersPage />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="Admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="modulos" element={<ModulesPage />} />
            <Route path="formularios" element={<FormsPage />} />
            <Route path="acciones" element={<ActionsPage />} />
            <Route path="tipos-documento" element={<DocumentTypesPage />} />
            <Route path="regiones" element={<RegionsPage />} />
            <Route path="contactos" element={<ContactsPage />} />
          </Route>
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}

      {showLogin && (
        <LoginModal onClose={closeModals} onSwitchToRegister={openRegister} />
      )}
      {showRegister && (
        <RegisterModal onClose={closeModals} onSwitchToLogin={openLogin} />
      )}
    </>
  );
}
