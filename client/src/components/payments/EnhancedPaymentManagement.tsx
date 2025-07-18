import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  MenuItem,
  Chip,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  AccountBalance as BalanceIcon,
  SwapHoriz as DualEntryIcon,
  Business as VendorIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Payment {
  _id: string;
  booking?: {
    _id: string;
    bookingNumber: string;
  };
  customer?: {
    _id: string;
    name: string;
  };
  type: string;
  category: string;
  description: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  referenceNumber: string;
  notes: string;
  createdAt: string;
}

interface Booking {
  _id: string;
  bookingNumber: string;
  customer?: {
    _id: string;
    name: string;
  };
  customerId?: string;
}

interface VendorTransaction {
  _id: string;
  bookingId: string;
  vendorName: string;
  vehicleRegistration: string;
  amount: number;
  type: 'payable' | 'receivable';
  transactionDate: string;
  status: 'pending' | 'paid' | 'received';
  reference: string;
  notes: string;
  dueDate: string;
}

interface Balance {
  customerId: string;
  customerName: string;
  totalBookings: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface VendorBalance {
  vendorName: string;
  totalPayables: number;
  totalReceivables: number;
  netBalance: number;
  pendingPayments: number;
  overduePayments: number;
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

export default function EnhancedPaymentManagement() {
  const [currentTab, setCurrentTab] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [vendorTransactions, setVendorTransactions] = useState<VendorTransaction[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [vendorBalances, setVendorBalances] = useState<VendorBalance[]>([]);
  const [open, setOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingVendorTransaction, setEditingVendorTransaction] = useState<VendorTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vendors, setVendors] = useState<{ name: string }[]>([]);

  const [paymentFormData, setPaymentFormData] = useState({
    bookingId: '',
    customerId: '',
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    reference: '',
    notes: ''
  });

  const [vendorFormData, setVendorFormData] = useState({
    bookingId: '',
    vendorName: '',
    vehicleRegistration: '',
    amount: '',
    type: 'payable' as 'payable' | 'receivable',
    transactionDate: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'paid' | 'received',
    reference: '',
    notes: '',
    dueDate: ''
  });

  const [alert, setAlert] = useState<{ show: boolean; message: string; severity: 'success' | 'error' }>({
    show: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchPayments(),
        fetchVendorTransactions(),
        fetchBalances(),
        fetchVendorBalances(),
        fetchCustomers(),
        fetchBookings(),
        fetchVendors()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched payments:', response.data);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchVendorTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vendor-transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendorTransactions(response.data);
    } catch (error) {
      console.error('Error fetching vendor transactions:', error);
    }
  };

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/payments/balances`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalances(response.data);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const fetchVendorBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vendor-transactions/balances`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendorBalances(response.data);
    } catch (error) {
      console.error('Error fetching vendor balances:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched bookings:', response.data);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Extract unique vendors from outsourced vehicles
      const vendorNames = response.data
        .filter((vehicle: any) => vehicle.vehicleType === 'Outsourced-in' && vehicle.vendorInfo?.vendorName)
        .map((vehicle: any) => vehicle.vendorInfo.vendorName as string);
      const uniqueVendors: string[] = Array.from(new Set(vendorNames));
      setVendors(uniqueVendors.map((name: string) => ({ name })));
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const showAlert = (message: string, severity: 'success' | 'error') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const handlePaymentSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('=== Payment Submission Debug ===');
      console.log('Form Data:', paymentFormData);
      console.log('Selected Booking ID:', paymentFormData.bookingId);
      console.log('Selected Customer ID:', paymentFormData.customerId);
      
      // Validate required fields
      if (!paymentFormData.bookingId) {
        showAlert('Please select a booking', 'error');
        return;
      }
      
      // Temporarily comment out customer validation to see backend error
      /*
      if (!paymentFormData.customerId) {
        showAlert('Customer information is missing. Please reselect the booking.', 'error');
        return;
      }
      */
      
      if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
        showAlert('Please enter a valid amount', 'error');
        return;
      }
      
      // Map frontend form data to backend schema
      const paymentData: any = {
        booking: paymentFormData.bookingId,
        type: 'Receivable', // Default for customer payments
        category: 'Rental Payment', // Default category
        description: paymentFormData.notes || 'Payment received',
        amount: parseFloat(paymentFormData.amount),
        paidAmount: parseFloat(paymentFormData.amount), // Assuming full payment for now
        paymentDate: paymentFormData.paymentDate,
        paymentMethod: paymentFormData.paymentMethod,
        status: paymentFormData.status,
        referenceNumber: paymentFormData.reference,
        notes: paymentFormData.notes
      };
      
      // Only add customer field if we have a valid customer ID
      if (paymentFormData.customerId) {
        paymentData.customer = paymentFormData.customerId;
      }
      
      console.log('Sending payment data:', paymentData);
      
      if (editingPayment) {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/payments/${editingPayment._id}`, paymentData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update response:', response);
        showAlert('Payment updated successfully', 'success');
      } else {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/payments`, paymentData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Create response:', response);
        showAlert('Payment created successfully', 'success');
      }

      fetchPayments();
      fetchBalances();
      handlePaymentClose();
    } catch (error: any) {
      console.error('=== Payment Submission Error ===');
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save payment';
      showAlert(errorMessage, 'error');
    }
  };

  const handleVendorTransactionSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingVendorTransaction) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/vendor-transactions/${editingVendorTransaction._id}`, vendorFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Vendor transaction updated successfully', 'success');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/vendor-transactions`, vendorFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Vendor transaction created successfully', 'success');
      }

      fetchVendorTransactions();
      fetchVendorBalances();
      handleVendorClose();
    } catch (error) {
      console.error('Error saving vendor transaction:', error);
      showAlert('Failed to save vendor transaction', 'error');
    }
  };

  const handlePaymentClose = () => {
    setOpen(false);
    setEditingPayment(null);
    setPaymentFormData({
      bookingId: '',
      customerId: '',
      amount: '',
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      reference: '',
      notes: ''
    });
  };

  const handleVendorClose = () => {
    setVendorDialogOpen(false);
    setEditingVendorTransaction(null);
    setVendorFormData({
      bookingId: '',
      vendorName: '',
      vehicleRegistration: '',
      amount: '',
      type: 'payable',
      transactionDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      reference: '',
      notes: '',
      dueDate: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'received':
        return 'success';
      case 'pending':
        return 'warning';
      case 'unpaid':
      case 'failed':
      case 'overdue':
        return 'error';
      case 'balance':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'payable' ? 'error' : 'success';
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Enhanced Payment Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={() => setOpen(true)}
          >
            Add Payment
          </Button>
          <Button
            variant="outlined"
            startIcon={<DualEntryIcon />}
            onClick={() => setVendorDialogOpen(true)}
          >
            Vendor Transaction
          </Button>
        </Stack>
      </Stack>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
        <Tab label="Customer Payments" icon={<PaymentIcon />} />
        <Tab label="Vendor Transactions" icon={<VendorIcon />} />
        <Tab label="Customer Balances" icon={<BalanceIcon />} />
        <Tab label="Vendor Balances" icon={<DualEntryIcon />} />
      </Tabs>

      {/* Customer Payments Tab */}
      <TabPanel value={currentTab} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>{payment.customer?.name || 'N/A'}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{payment.referenceNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Vendor Transactions Tab */}
      <TabPanel value={currentTab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vendor</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendorTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{transaction.vendorName}</TableCell>
                  <TableCell>{transaction.vehicleRegistration}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type.toUpperCase()}
                      color={getTransactionTypeColor(transaction.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${transaction.amount}</TableCell>
                  <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={getStatusColor(transaction.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Customer Balances Tab */}
      <TabPanel value={currentTab} index={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {balances.map((balance) => (
            <Card key={balance.customerId}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {balance.customerName}
                </Typography>
                <Stack spacing={1}>
                    <Typography variant="body2">
                      Total Bookings: {balance.totalBookings}
                    </Typography>
                    <Typography variant="body2">
                      Total Amount: ${balance.totalAmount}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Paid: ${balance.paidAmount}
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      Pending: ${balance.pendingAmount}
                    </Typography>
                    {balance.overdueAmount > 0 && (
                      <Typography variant="body2" color="error.main">
                        Overdue: ${balance.overdueAmount}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
          ))}
        </Box>
      </TabPanel>

      {/* Vendor Balances Tab */}
      <TabPanel value={currentTab} index={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {vendorBalances.map((balance) => (
            <Card key={balance.vendorName}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {balance.vendorName}
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="error.main">
                    Total Payables: ${balance.totalPayables}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Total Receivables: ${balance.totalReceivables}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    color={balance.netBalance >= 0 ? 'success.main' : 'error.main'}
                  >
                    Net Balance: ${balance.netBalance}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    Pending Payments: ${balance.pendingPayments}
                  </Typography>
                  {balance.overduePayments > 0 && (
                    <Typography variant="body2" color="error.main">
                      Overdue: ${balance.overduePayments}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* Payment Dialog */}
      <Dialog open={open} onClose={handlePaymentClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? 'Edit Payment' : 'Add New Payment'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Booking</InputLabel>
                <Select
                  value={paymentFormData.bookingId}
                  label="Booking"
                  onChange={(e) => {
                    const selectedBooking = bookings.find((booking: Booking) => booking._id === e.target.value);
                    console.log('=== Booking Selection Debug ===');
                    console.log('Selected booking full object:', JSON.stringify(selectedBooking, null, 2));
                    console.log('Customer from booking:', selectedBooking?.customer);
                    console.log('Customer ID from booking.customer._id:', selectedBooking?.customer?._id);
                    console.log('Customer ID from booking.customerId:', selectedBooking?.customerId);
                    console.log('All available bookings:', JSON.stringify(bookings, null, 2));
                    
                    const customerId = selectedBooking?.customer?._id || selectedBooking?.customerId || '';
                    console.log('Final customer ID being set:', customerId);
                    
                    setPaymentFormData({ 
                      ...paymentFormData, 
                      bookingId: e.target.value,
                      customerId: customerId
                    });
                  }}
                >
                  {bookings.map((booking: Booking) => (
                    <MenuItem key={booking._id} value={booking._id}>
                      {booking.bookingNumber} - {booking.customer?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Customer Display Field */}
              <TextField
                fullWidth
                label="Customer"
                value={(() => {
                  const selectedBooking = bookings.find((booking: Booking) => booking._id === paymentFormData.bookingId);
                  return selectedBooking?.customer?.name || 'No customer selected';
                })()}
                disabled
                variant="outlined"
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Amount ($)"
                type="number"
                value={paymentFormData.amount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
              />
            </Stack>
            
            {/* Debug info */}
            {paymentFormData.customerId && (
              <Alert severity="info">
                Selected Customer ID: {paymentFormData.customerId}
              </Alert>
            )}
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentFormData.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentFormData.paymentDate}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={paymentFormData.status}
                  label="Status"
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="balance">Balance</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Reference"
                value={paymentFormData.reference}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, reference: e.target.value })}
              />
            </Stack>
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={paymentFormData.notes}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentClose}>Cancel</Button>
          <Button onClick={handlePaymentSubmit} variant="contained">
            {editingPayment ? 'Update' : 'Add'} Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vendor Transaction Dialog */}
      <Dialog open={vendorDialogOpen} onClose={handleVendorClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVendorTransaction ? 'Edit Vendor Transaction' : 'Add Vendor Transaction'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={vendorFormData.vendorName}
                  label="Vendor"
                  onChange={(e) => setVendorFormData({ ...vendorFormData, vendorName: e.target.value })}
                >
                  {vendors.map((vendor: any) => (
                    <MenuItem key={vendor.name} value={vendor.name}>
                      {vendor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Vehicle Registration"
                value={vendorFormData.vehicleRegistration}
                onChange={(e) => setVendorFormData({ ...vendorFormData, vehicleRegistration: e.target.value })}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={vendorFormData.type}
                  label="Transaction Type"
                  onChange={(e) => setVendorFormData({ ...vendorFormData, type: e.target.value })}
                >
                  <MenuItem value="payable">Payable (We owe vendor)</MenuItem>
                  <MenuItem value="receivable">Receivable (Vendor owes us)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Amount ($)"
                type="number"
                value={vendorFormData.amount}
                onChange={(e) => setVendorFormData({ ...vendorFormData, amount: e.target.value })}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Transaction Date"
                type="date"
                value={vendorFormData.transactionDate}
                onChange={(e) => setVendorFormData({ ...vendorFormData, transactionDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={vendorFormData.dueDate}
                onChange={(e) => setVendorFormData({ ...vendorFormData, dueDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={vendorFormData.status}
                  label="Status"
                  onChange={(e) => setVendorFormData({ ...vendorFormData, status: e.target.value as any })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="received">Received</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Reference"
                value={vendorFormData.reference}
                onChange={(e) => setVendorFormData({ ...vendorFormData, reference: e.target.value })}
              />
            </Stack>
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={vendorFormData.notes}
              onChange={(e) => setVendorFormData({ ...vendorFormData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVendorClose}>Cancel</Button>
          <Button onClick={handleVendorTransactionSubmit} variant="contained">
            {editingVendorTransaction ? 'Update' : 'Add'} Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
