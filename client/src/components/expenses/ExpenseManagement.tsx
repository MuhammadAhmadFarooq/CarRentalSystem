import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Card,
  CardContent,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Expense {
  _id: string;
  booking?: { _id: string; bookingNumber: string };
  vehicle?: { _id: string; model: string; registrationNumber: string };
  driver?: { _id: string; name: string };
  category: string;
  description: string;
  amount: number;
  date: string;
  receiptNumber?: string;
  vendor?: string;
  paymentMethod: string;
  status: string;
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
  createdAt: string;
}

interface Vehicle {
  _id: string;
  model: string;
  registrationNumber: string;
}

interface Driver {
  _id: string;
  name: string;
}

interface Booking {
  _id: string;
  bookingNumber: string;
}

const EXPENSE_CATEGORIES = ['Fuel', 'Toll', 'Maintenance', 'Parking', 'Food', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Cheque'];
const EXPENSE_STATUS = ['pending', 'approved', 'rejected'];

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [alert, setAlert] = useState<{ show: boolean; message: string; severity: 'success' | 'error' }>({
    show: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    booking: '',
    vehicle: '',
    driver: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    vendor: '',
    paymentMethod: 'Cash',
    status: 'pending',
    notes: ''
  });

  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchVehicles();
    fetchDrivers();
    fetchBookings();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setExpenses(response.data);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      showAlert('Failed to fetch expenses', 'error');
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/drivers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(response.data);
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching bookings with token:', token ? 'Token exists' : 'No token');
      const response = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Bookings response:', response.data);
      setBookings(response.data);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const showAlert = (message: string, severity: 'success' | 'error') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingExpense 
        ? `http://localhost:5000/api/expenses/${editingExpense._id}`
        : 'http://localhost:5000/api/expenses';
      
      const method = editingExpense ? 'put' : 'post';
      
      // Clean up the form data to handle empty ObjectId fields
      const cleanedFormData = {
        ...formData,
        booking: formData.booking || undefined,
        vehicle: formData.vehicle || undefined,
        driver: formData.driver || undefined,
        amount: Number(formData.amount)
      };
      
      await axios[method](url, cleanedFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showAlert(`Expense ${editingExpense ? 'updated' : 'created'} successfully`, 'success');
      setOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      showAlert('Failed to save expense', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Expense deleted successfully', 'success');
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        showAlert('Failed to delete expense', 'error');
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      booking: expense.booking?._id || '',
      vehicle: expense.vehicle?._id || '',
      driver: expense.driver?._id || '',
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date.split('T')[0],
      receiptNumber: expense.receiptNumber || '',
      vendor: expense.vendor || '',
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      notes: expense.notes || ''
    });
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      booking: '',
      vehicle: '',
      driver: '',
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      receiptNumber: '',
      vendor: '',
      paymentMethod: 'Cash',
      status: 'pending',
      notes: ''
    });
    setEditingExpense(null);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fuel': return 'primary';
      case 'Maintenance': return 'error';
      case 'Toll': return 'info';
      case 'Parking': return 'secondary';
      default: return 'default';
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return categoryTotals;
  };

  const filteredExpenses = expenses.filter(expense => {
    if (tabValue === 1 && expense.status !== 'pending') return false;
    if (tabValue === 2 && expense.status !== 'approved') return false;
    if (tabValue === 3 && expense.status !== 'rejected') return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Expense Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { resetForm(); setOpen(true); }}
        >
          Add Expense
        </Button>
      </Stack>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
          gap: 3, 
          mb: 3 
        }}
      >
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4" color="primary">
              ${getTotalExpenses().toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pending Approval
            </Typography>
            <Typography variant="h4" color="warning.main">
              {expenses.filter(e => e.status === 'pending').length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              This Month
            </Typography>
            <Typography variant="h4" color="success.main">
              ${expenses.filter(e => 
                new Date(e.date).getMonth() === new Date().getMonth()
              ).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Categories
            </Typography>
            <Typography variant="h4" color="info.main">
              {Object.keys(getExpensesByCategory()).length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by description, vendor, receipt..."
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {EXPENSE_CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {EXPENSE_STATUS.map(status => (
                  <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="date"
              label="Start Date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <TextField
              type="date"
              label="End Date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All Expenses (${expenses.length})`} />
          <Tab label={`Pending (${expenses.filter(e => e.status === 'pending').length})`} />
          <Tab label={`Approved (${expenses.filter(e => e.status === 'approved').length})`} />
          <Tab label={`Rejected (${expenses.filter(e => e.status === 'rejected').length})`} />
        </Tabs>
      </Box>

      {/* Expenses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={expense.category} 
                    color={getCategoryColor(expense.category) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>
                  {expense.vehicle ? `${expense.vehicle.model} (${expense.vehicle.registrationNumber})` : '-'}
                </TableCell>
                <TableCell>{expense.driver?.name || '-'}</TableCell>
                <TableCell>${expense.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={expense.status.charAt(0).toUpperCase() + expense.status.slice(1)} 
                    color={getStatusColor(expense.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(expense)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(expense._id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category}
                  label="Category *"
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {EXPENSE_CATEGORIES.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Amount *"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </Stack>

            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="Date *"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  {PAYMENT_METHODS.map(method => (
                    <MenuItem key={method} value={method}>{method}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Receipt Number"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({...formData, receiptNumber: e.target.value})}
              />
              <TextField
                fullWidth
                label="Vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={formData.vehicle}
                  label="Vehicle"
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                >
                  <MenuItem value="">None</MenuItem>
                  {vehicles.map(vehicle => (
                    <MenuItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.model} ({vehicle.registrationNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Driver</InputLabel>
                <Select
                  value={formData.driver}
                  label="Driver"
                  onChange={(e) => setFormData({...formData, driver: e.target.value})}
                >
                  <MenuItem value="">None</MenuItem>
                  {drivers.map(driver => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Booking</InputLabel>
                <Select
                  value={formData.booking}
                  label="Booking"
                  onChange={(e) => setFormData({...formData, booking: e.target.value})}
                >
                  <MenuItem value="">None</MenuItem>
                  {bookings.map(booking => (
                    <MenuItem key={booking._id} value={booking._id}>
                      {booking.bookingNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  {EXPENSE_STATUS.map(status => (
                    <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes or comments..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.category || !formData.description || !formData.amount}
          >
            {editingExpense ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
