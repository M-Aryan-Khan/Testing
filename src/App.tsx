import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { ConversationsPage } from "./pages/ConversationsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GoalsPage } from "./pages/GoalsPage";
import { HealthToolsPage } from "./pages/HealthToolsPage";
import { MetricsPage } from "./pages/MetricsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ProfilePage } from "./pages/ProfilePage";

function ProtectedApp() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="health" element={<HealthToolsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="metrics" element={<MetricsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}
