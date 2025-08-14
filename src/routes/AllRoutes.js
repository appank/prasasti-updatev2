import { Routes, Route } from "react-router-dom";
import SuratKeteranganPage from '../pages/SuratKeteranganPage';
import HealthCertificatePage from '../pages/HealthCertificatePage';
import LetterPDF from '../pages/LetterPDF';
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminRegisterPage from "../pages/AdminRegisterPage";
import VerifikatorLoginPage from "../pages/VerifikatorLoginPage";
import VerifikatorRegisterPage from "../pages/VerifikatorRegisterPage";
import UserProtectedRoute from "../auth/UserProtectedRoute";
import AdminProtectedRoute from "../auth/AdminProtectedRoute";
import VerifikatorProtectedRoute from "../auth/VerifikatorProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import VerifikatorDashboard from "../pages/VerifikatorDashboard";
import DemoUserDashboard from "../pages/DemoUserDashboard";

function AllRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/demo" element={<DemoUserDashboard />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />
      <Route path="/verifikator/login" element={<VerifikatorLoginPage />} />
      <Route path="/verifikator/register" element={<VerifikatorRegisterPage />} />

      {/* User Protected Routes */}
      <Route path="/dashboard" element={<UserProtectedRoute><UserDashboard /></UserProtectedRoute>} />
      <Route path="/surat-keterangan" element={<UserProtectedRoute><SuratKeteranganPage /></UserProtectedRoute>} />
      <Route path="/LetterPDF" element={<UserProtectedRoute><LetterPDF /></UserProtectedRoute>} />
      <Route path="/sertifikat" element={<UserProtectedRoute><HealthCertificatePage /></UserProtectedRoute>} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/surat-keterangan/:id"
        element={
          <AdminProtectedRoute>
            <DashboardLayout>
              <SuratKeteranganPage />
            </DashboardLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Verifikator Protected Routes */}
      <Route
        path="/verifikator"
        element={
          <VerifikatorProtectedRoute>
            <DashboardLayout>
              <VerifikatorDashboard />
            </DashboardLayout>
          </VerifikatorProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AllRoutes;
