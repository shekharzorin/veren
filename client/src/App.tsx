import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ProjectList from './pages/projects/ProjectList';
import CreateProject from './pages/projects/CreateProject';
import ProjectDetails from './pages/projects/ProjectDetails';
import Clients from './pages/agent/Clients';
import CreateEOI from './pages/transactions/CreateEOI';
import CreateBooking from './pages/transactions/CreateBooking';
import AgentTransactions from './pages/transactions/AgentTransactions';

import Wallet from './pages/Wallet';
import PaymentGateway from './pages/PaymentGateway';
import TransactionSuccess from './pages/transactions/TransactionSuccess';
import PublicPaymentPage from './pages/public/PublicPaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { PreferencesProvider } from './context/PreferencesContext';

function App() {
  return (
    <PreferencesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Mock Gateway - External Route */}
          <Route path="/mock-gateway/:paymentId" element={<PaymentGateway />} />
          <Route path="/pay/:id" element={<PublicPaymentPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Project Routes */}
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/create" element={<CreateProject />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />

              {/* Client Routes */}
              <Route path="/clients" element={<Clients />} />

              {/* Transaction Routes */}
              <Route path="/transactions" element={<AgentTransactions />} />
              <Route path="/transactions/eoi/create" element={<CreateEOI />} />
              <Route path="/transactions/booking/create" element={<CreateBooking />} />
              <Route path="/transactions/:id/success" element={<TransactionSuccess />} />

              {/* Wallet */}
              <Route path="/wallet" element={<Wallet />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </PreferencesProvider>
  );
}

export default App;
