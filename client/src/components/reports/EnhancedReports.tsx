import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  Business as VendorIcon,
  SwapHoriz as DualEntryIcon
} from '@mui/icons-material';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface VehicleUsageReport {
  vehicleId: string;
  make: string;
  model: string;
  licensePlate: string;
  totalBookings: number;
  totalRevenue: number;
  utilizationRate: number;
}

interface DriverPerformance {
  driverId: string;
  name: string;
  totalAssignments: number;
  totalExpenses: number;
  avgRating: number;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  ownFleetProfit: number;
  outsourcedProfit: number;
}

interface MonthlyBreakdown {
  month: string;
  totalBookings: number;
  totalRevenue: number;
  ownFleetRevenue: number;
  outsourcedRevenue: number;
}

interface TabPanelProps {
  readonly children?: React.ReactNode;
  readonly index: number;
  readonly value: number;
}

function TabPanel(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EnhancedReports() {
  const [currentTab, setCurrentTab] = useState(0);
  const [vehicleUsageData, setVehicleUsageData] = useState<VehicleUsageReport[]>([]);
  const [vendorData, setVendorData] = useState<DriverPerformance[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    vehicleType: 'all',
    vendorName: 'all'
  });

  const [alert, setAlert] = useState<{ show: boolean; message: string; severity: 'success' | 'error' }>({
    show: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [vehicleUsageRes, vendorRes, financialRes, monthlyRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/reports/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filters
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/reports/drivers`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filters
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/reports/financial`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filters
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/reports/monthly`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filters
        })
      ]);

      console.log('=== Reports Data Debug ===');
      console.log('Vehicle Usage Response:', vehicleUsageRes.data);
      console.log('Driver Performance Response:', vendorRes.data);
      console.log('Financial Summary Response:', financialRes.data);
      console.log('Monthly Data Response:', monthlyRes.data);

      setVehicleUsageData(vehicleUsageRes.data.vehiclePerformance || []);
      setVendorData(vendorRes.data.driverPerformance || []);
      setFinancialSummary(financialRes.data.financialSummary || null);
      setMonthlyData(monthlyRes.data.monthlyRentals || []);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, severity: 'success' | 'error') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const exportToExcel = (data: any[], filename: string, sheetName: string) => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      showAlert('Report exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showAlert('Failed to export report', 'error');
    }
  };

  const exportVehicleUsageReport = () => {
    const exportData = vehicleUsageData.map(vehicle => ({
      'Registration Number': vehicle.licensePlate,
      'Make & Model': `${vehicle.make} ${vehicle.model}`,
      'Total Bookings': vehicle.totalBookings,
      'Total Revenue': vehicle.totalRevenue,
      'Utilization Rate (%)': (vehicle.utilizationRate * 100).toFixed(2)
    }));
    
    exportToExcel(exportData, 'vehicle_usage_report', 'Vehicle Usage');
  };

  const exportVendorReport = () => {
    const exportData = vendorData.map(driver => ({
      'Driver Name': driver.name,
      'Total Assignments': driver.totalAssignments,
      'Total Expenses': driver.totalExpenses,
      'Average Rating': driver.avgRating
    }));
    
    exportToExcel(exportData, 'driver_performance_report', 'Driver Performance');
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case 'Company-owned': return 'primary';
      case 'Outsourced-in': return 'warning';
      case 'Outsourced-out': return 'info';
      default: return 'default';
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'success';
    if (balance < 0) return 'error';
    return 'default';
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Enhanced Reports & Analytics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchReportData}
        >
          Refresh Data
        </Button>
      </Stack>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Report Filters</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={filters.vehicleType}
                label="Vehicle Type"
                onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Company-owned">Company-owned</MenuItem>
                <MenuItem value="Outsourced-in">Outsourced-in</MenuItem>
                <MenuItem value="Outsourced-out">Outsourced-out</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Financial Summary Cards */}
      {financialSummary && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(financialSummary.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CarIcon sx={{ color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Own Fleet Profit
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(financialSummary.ownFleetProfit)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VendorIcon sx={{ color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Outsourced Profit
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(financialSummary.outsourcedProfit)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Expenses
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(financialSummary.totalExpenses)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Net Profit
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(financialSummary.netProfit)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
        <Tab label="Vehicle Usage" icon={<CarIcon />} />
        <Tab label="Vendor P&R" icon={<DualEntryIcon />} />
        <Tab label="Monthly Analysis" icon={<TrendingUpIcon />} />
      </Tabs>

      {/* Vehicle Usage Report Tab */}
      <TabPanel value={currentTab} index={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Vehicle Usage Report by Category</Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportVehicleUsageReport}
          >
            Export Excel
          </Button>
        </Stack>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell align="right">Bookings</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Utilization %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicleUsageData.map((vehicle) => (
                <TableRow key={vehicle.vehicleId}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {vehicle.make} {vehicle.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {vehicle.licensePlate}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{vehicle.totalBookings}</TableCell>
                  <TableCell align="right">${vehicle.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell align="right">{(vehicle.utilizationRate * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Driver Performance Tab */}
      <TabPanel value={currentTab} index={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Driver Performance</Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportVendorReport}
          >
            Export Excel
          </Button>
        </Stack>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver Name</TableCell>
                <TableCell align="right">Total Assignments</TableCell>
                <TableCell align="right">Total Expenses</TableCell>
                <TableCell align="right">Average Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendorData.map((driver) => (
                <TableRow key={driver.driverId}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {driver.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{driver.totalAssignments}</TableCell>
                  <TableCell align="right">${driver.totalExpenses.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={driver.avgRating.toFixed(1)}
                      color={driver.avgRating >= 4.0 ? 'success' : driver.avgRating >= 3.0 ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Monthly Analysis Tab */}
      <TabPanel value={currentTab} index={2}>
        <Typography variant="h6" gutterBottom>Monthly Breakdown Analysis</Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Total Bookings</TableCell>
                <TableCell align="right">Total Revenue</TableCell>
                <TableCell align="right">Own Fleet Revenue</TableCell>
                <TableCell align="right">Outsourced Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyData.map((month) => (
                <TableRow key={month.month}>
                  <TableCell>{month.month}</TableCell>
                  <TableCell align="right">{month.totalBookings}</TableCell>
                  <TableCell align="right">${month.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell align="right">${month.ownFleetRevenue.toLocaleString()}</TableCell>
                  <TableCell align="right">${month.outsourcedRevenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading report data...</Typography>
        </Box>
      )}
    </Box>
  );
}
