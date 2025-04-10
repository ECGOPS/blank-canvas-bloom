
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';
import ReportFaultPage from './pages/ReportFaultPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UserManagementPage from './pages/UserManagementPage';
import VITInspectionPage from './pages/asset-management/VITInspectionPage';
import VITInspectionFormPage from './pages/asset-management/VITInspectionFormPage';
import VITInspectionDetailsPage from './pages/asset-management/VITInspectionDetailsPage';
import VITInspectionManagementPage from './pages/asset-management/VITInspectionManagementPage';
import EditVITInspectionPage from './pages/asset-management/EditVITInspectionPage';
import LoadMonitoringPage from './pages/asset-management/LoadMonitoringPage';
import SubstationInspectionPage from './pages/asset-management/SubstationInspectionPage';
import InspectionManagementPage from './pages/asset-management/InspectionManagementPage';
import InspectionDetailsPage from './pages/asset-management/InspectionDetailsPage';
import EditInspectionPage from './pages/asset-management/EditInspectionPage';
import LoadMonitoringManagementPage from './pages/asset-management/LoadMonitoringManagementPage';
import LoadMonitoringDetailsPage from './pages/asset-management/LoadMonitoringDetailsPage';
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <DataProvider>
            <Routes>
              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Fault Reporting */}
              <Route path="/report-fault" element={<ReportFaultPage />} />
              
              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsPage />} />
              
              {/* User Management */}
              <Route path="/user-management" element={<UserManagementPage />} />
              
              {/* Asset Management - VIT */}
              <Route path="/asset-management/vit-inspection" element={<VITInspectionPage />} />
              <Route path="/asset-management/vit-inspection-form/:id" element={<VITInspectionFormPage />} />
              <Route path="/asset-management/vit-inspection/:id" element={<VITInspectionDetailsPage />} />
              <Route path="/asset-management/vit-inspection-management" element={<VITInspectionManagementPage />} />
              <Route path="/asset-management/edit-vit-inspection/:id" element={<EditVITInspectionPage />} />
              
              {/* Asset Management - Substation Inspection */}
              <Route path="/asset-management/substation-inspection" element={<SubstationInspectionPage />} />
              <Route path="/asset-management/inspection-management" element={<InspectionManagementPage />} />
              <Route path="/asset-management/inspection-details/:id" element={<InspectionDetailsPage />} />
              <Route path="/asset-management/edit-inspection/:id" element={<EditInspectionPage />} />
              
              {/* Asset Management - Load Monitoring */}
              <Route path="/asset-management/load-monitoring" element={<LoadMonitoringPage />} />
              <Route path="/asset-management/load-monitoring-management" element={<LoadMonitoringManagementPage />} />
              <Route path="/asset-management/load-monitoring-details/:id" element={<LoadMonitoringDetailsPage />} />
              
              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
