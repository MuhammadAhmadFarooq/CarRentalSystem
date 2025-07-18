import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  DirectionsCar,
  People,
  Assignment,
  AttachMoney,
  Warning
} from '@mui/icons-material';
import axios from 'axios';

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  totalCustomers: number;
  activeBookings: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

interface RecentBooking {
  _id: string;
  customerName: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Use correct backend endpoints
      const [summaryResponse, activitiesResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/summary`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/recent-activities`, { headers })
      ]);

      // Map backend summary to expected stats object
      const summary = summaryResponse.data;
      setStats({
        totalVehicles: (summary.vehicleStatus?.reduce((acc: number, v: any) => acc + (v.count || 0), 0)) || 0,
        availableVehicles: (summary.vehicleStatus?.find((v: any) => (v._id || '').toLowerCase() === 'available')?.count) || 0,
        totalCustomers: summary.totalCustomers || 0, // You may need to add this to backend summary
        activeBookings: summary.totalTrips || 0,
        monthlyRevenue: summary.monthlyIncome || 0,
        pendingPayments: summary.outstandingReceivables || 0
      });

      // Map recent bookings from recent-activities endpoint
      const activities = activitiesResponse.data;
      const bookings = (activities.recentBookings || []).map((b: any) => ({
        _id: b._id,
        customerName: b.customer?.name || 'N/A',
        vehicleModel: b.vehicle?.registrationNumber || 'N/A',
        startDate: b.createdAt,
        endDate: b.createdAt,
        status: b.status,
        totalAmount: b.totalAmount || 0 // You may want to adjust this if available
      }));
      setRecentBookings(bookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        gap: 3,
        mb: 4 
      }}>
        <StatCard
          title="Total Vehicles"
          value={stats?.totalVehicles || 0}
          icon={<DirectionsCar sx={{ fontSize: 40 }} />}
          color="primary.main"
        />
        <StatCard
          title="Available Vehicles"
          value={stats?.availableVehicles || 0}
          icon={<DirectionsCar sx={{ fontSize: 40 }} />}
          color="success.main"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={<People sx={{ fontSize: 40 }} />}
          color="info.main"
        />
        <StatCard
          title="Active Bookings"
          value={stats?.activeBookings || 0}
          icon={<Assignment sx={{ fontSize: 40 }} />}
          color="warning.main"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats?.monthlyRevenue || 0}`}
          icon={<AttachMoney sx={{ fontSize: 40 }} />}
          color="success.main"
        />
        <StatCard
          title="Pending Payments"
          value={`$${stats?.pendingPayments || 0}`}
          icon={<Warning sx={{ fontSize: 40 }} />}
          color="error.main"
        />
      </Box>

      {/* Recent Bookings */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Bookings
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{booking.vehicleModel}</TableCell>
                    <TableCell>{new Date(booking.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={
                          booking.status === 'active' ? 'success' :
                          booking.status === 'completed' ? 'primary' :
                          booking.status === 'cancelled' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${booking.totalAmount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No recent bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
