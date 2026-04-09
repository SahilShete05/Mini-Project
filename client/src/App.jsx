import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DoctorListPage from './pages/DoctorListPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/doctors" element={<DoctorListPage />} />
            <Route
              path="/book"
              element={
                <ProtectedRoute roles={['patient']}>
                  <BookAppointmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute roles={['patient']}>
                  <PatientDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute roles={['doctor']}>
                  <DoctorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPanelPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<RoleRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function RoleRedirect() {
  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  if (!token || !rawUser) {
    return <Navigate to="/auth" replace />;
  }

  const user = JSON.parse(rawUser);

  if (user.role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/patient/dashboard" replace />;
}

export default App;


