import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientPortal } from './pages/PatientPortal';
import { ClinicianDashboard, PatientTriageView } from './pages/ClinicianDashboard';
import { AnalyticsView } from './components/clinician/AnalyticsView';
import { EHRSyncView } from './components/clinician/EHRSyncView';
import { AuditView } from './components/clinician/AuditView';

export const App: React.FC = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#1D1D1F',
            borderRadius: '1rem',
            border: '1px solid #E5E5EA',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/patient" element={<PatientPortal />} />
        <Route path="/clinician" element={<ClinicianDashboard />}>
          <Route index element={<PatientTriageView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="ehr" element={<EHRSyncView />} />
          <Route path="audit" element={<AuditView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

