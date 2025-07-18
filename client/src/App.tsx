import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import VehicleManagement from './components/vehicles/VehicleManagement';
import OutsourcedVehicleManagement from './components/outsourced/OutsourcedVehicleManagement';
import CustomerManagement from './components/customers/CustomerManagement';
import DriverManagement from './components/drivers/DriverManagement';
import BookingManagement from './components/bookings/BookingManagement';
import ExpenseManagement from './components/expenses/ExpenseManagement';
import PaymentManagement from './components/payments/PaymentManagement';
import Reports from './components/reports/Reports';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/vehicles" element={<VehicleManagement />} />
                      <Route path="/outsourced-vehicles" element={<OutsourcedVehicleManagement />} />
                      <Route path="/customers" element={<CustomerManagement />} />
                      <Route path="/drivers" element={<DriverManagement />} />
                      <Route path="/bookings" element={<BookingManagement />} />
                      <Route path="/expenses" element={<ExpenseManagement />} />
                      <Route path="/payments" element={<PaymentManagement />} />
                      <Route path="/reports" element={<Reports />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
