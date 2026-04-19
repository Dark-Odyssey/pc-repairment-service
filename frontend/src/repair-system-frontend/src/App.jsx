import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ClientDashboard from "./pages/ClientDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

// Komponent zabezpieczający trasy (ProtectedRoute)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', padding: '50px'}}>Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // brak dostępu
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Trasa dla klienta (może wymagać ID w URL lub polegać na lokalnym stanie/sesji po wpisaniu kodu) */}
      <Route path="/status" element={<ClientDashboard />} />

      {/* Zabezpieczone trasy dla pracownika i admina */}
      <Route 
        path="/dashboard/worker/*" 
        element={
          <ProtectedRoute allowedRoles={['worker', 'admin']}>
            <WorkerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
