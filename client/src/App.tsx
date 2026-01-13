import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ProjectList from './pages/projects/ProjectList';
import CreateProject from './pages/projects/CreateProject';
import ClientList from './pages/clients/ClientList';
import AddClient from './pages/clients/AddClient';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Project Routes */}
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/create" element={<CreateProject />} />

            {/* Client Routes */}
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/add" element={<AddClient />} />

            {/* Placeholder routes for now */}
            <Route path="/transactions" element={<div>Transactions Page (Coming Soon)</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
