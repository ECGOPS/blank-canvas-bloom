
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import SubstationInspectionPage from "./pages/asset-management/SubstationInspectionPage";
import InspectionDetailsPage from "./pages/asset-management/InspectionDetailsPage";
import InspectionManagementPage from "./pages/asset-management/InspectionManagementPage";
import EditInspectionPage from "./pages/asset-management/EditInspectionPage";
import VITInspectionPage from "./pages/asset-management/VITInspectionPage";
import VITInspectionDetailsPage from "./pages/asset-management/VITInspectionDetailsPage";
import VITInspectionFormPage from "./pages/asset-management/VITInspectionFormPage";
import EditVITInspectionPage from "./pages/asset-management/EditVITInspectionPage";
import LoadMonitoringPage from "./pages/asset-management/LoadMonitoringPage";
import LoadMonitoringManagementPage from "./pages/asset-management/LoadMonitoringManagementPage";
import LoadMonitoringDetailsPage from "./pages/asset-management/LoadMonitoringDetailsPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Asset Management Routes */}
            <Route path="/asset-management/substation-inspection" element={<SubstationInspectionPage />} />
            <Route path="/asset-management/inspection-details/:id" element={<InspectionDetailsPage />} />
            <Route path="/asset-management/inspection-management" element={<InspectionManagementPage />} />
            <Route path="/asset-management/edit-inspection/:id" element={<EditInspectionPage />} />
            <Route path="/asset-management/vit-inspection" element={<VITInspectionPage />} />
            <Route path="/asset-management/vit-inspection-details/:id" element={<VITInspectionDetailsPage />} />
            <Route path="/asset-management/vit-inspection-form/:id" element={<VITInspectionFormPage />} />
            <Route path="/asset-management/edit-vit-inspection/:id" element={<EditVITInspectionPage />} />
            <Route path="/asset-management/load-monitoring" element={<LoadMonitoringPage />} />
            <Route path="/asset-management/load-monitoring-management" element={<LoadMonitoringManagementPage />} />
            <Route path="/asset-management/load-monitoring-details/:id" element={<LoadMonitoringDetailsPage />} />
            <Route path="/asset-management/edit-load-monitoring/:id" element={<LoadMonitoringPage />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
