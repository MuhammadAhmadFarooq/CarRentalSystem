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
  Card,
  CardContent,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Booking {
  _id: string;
  bookingNumber?: string;
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  vehicle?: {
    _id: string;
    make: string;
    model: string;
    registrationNumber: string;
    vehicleType: string;
    dailyRate: number;
    vendorInfo?: {
      vendorName: string;
      dailyVendorRate: number;
    };
  };
  driver?: {
    _id: string;
    name: string;
    driverRates: {
      localDailyRate: number;
      outstationDailyRate: number;
      overtimeThresholdHours: number;
      overtimeHourlyRate: number;
    };
  };
  startDate?: string;
  endDate?: string;
  routeName?: string;
  showroomContactPerson?: {
    name: string;
    phone: string;
  };
  bookingContactPerson?: {
    name: string;
    phone: string;
  };
  dutyHours?: {
    scheduled: number;
    actual: number;
    overtime: number;
  };
  mileage?: {
    start: number;
    end: number;
    total: number;
  };
  isOutstation?: boolean;
  rentPerDay?: number;
  totalDays?: number;
  totalRent?: number;
  driverCharges?: {
    dailyRate: number;
    overtimeAmount: number;
    totalAmount: number;
  };
  vendorCharges?: {
    dailyRate: number;
    totalAmount: number;
  };
  taxDeduction?: {
    percentage: number;
    amount: number;
  };
  payment?: {
    totalAmount: number;
    receivedAmount: number;
    balanceAmount: number;
    taxDeduction: number;
    securityDeposit: number;
  };
  finalAmount?: number;
  status?: string;
  notes?: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  registrationNumber: string;
  vehicleType: string;
  dailyRate: number;
  status: string;
  vendorInfo?: {
    vendorName: string;
    dailyVendorRate: number;
  };
}

interface Driver {
  _id: string;
  name: string;
  contact: {
    phone: string;
  };
  driverRates: {
    localDailyRate: number;
    outstationDailyRate: number;
    overtimeThresholdHours: number;
    overtimeHourlyRate: number;
  };
  status: string;
}

export default function EnhancedBookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [open, setOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [alert, setAlert] = useState<{ show: boolean; message: string; severity: 'success' | 'error' }>({
    show: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    driverId: '',
    startDate: '',
    endDate: '',
    routeName: '',
    showroomContactName: '',
    showroomContactPhone: '',
    bookingContactName: '',
    bookingContactPhone: '',
    scheduledDutyHours: '12',
    actualDutyHours: '0',
    startMileage: '',
    endMileage: '',
    isOutstation: false,
    rentalType: 'Own',
    taxDeductionPercentage: '0',
    status: 'confirmed',
    notes: ''
  });

  // Calculated values
  const [calculations, setCalculations] = useState({
    totalDays: 0,
    rentPerDay: 0,
    totalRent: 0,
    driverDailyRate: 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    totalDriverCharges: 0,
    vendorDailyRate: 0,
    totalVendorCharges: 0,
    taxDeductionAmount: 0,
    finalAmount: 0,
    mileageUsed: 0
  });

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
    fetchVehicles();
    fetchDrivers();
  }, []);

  // Automatic calculations
  useEffect(() => {
    calculateBookingDetails();
  }, [formData.vehicleId, formData.driverId, formData.startDate, formData.endDate, 
      formData.actualDutyHours, formData.startMileage, formData.endMileage, 
      formData.isOutstation, formData.taxDeductionPercentage]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched bookings:', response.data);
      // Ensure we always have an array
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Set empty array on error
      showAlert('Failed to fetch bookings', 'error');
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const driversData = Array.isArray(response.data) ? response.data : [];
      setDrivers(driversData.filter((d: Driver) => d.status === 'active'));
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    }
  };

  const showAlert = (message: string, severity: 'success' | 'error') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const calculateBookingDetails = () => {
    if (!formData.vehicleId || !formData.startDate || !formData.endDate) {
      return;
    }

    const selectedVehicle = vehicles.find(v => v._id === formData.vehicleId);
    const selectedDriver = drivers.find(d => d._id === formData.driverId);

    if (!selectedVehicle) return;

    // Calculate total days
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate rental amount
    const rentPerDay = selectedVehicle.dailyRate;
    const totalRent = rentPerDay * totalDays;

    // Calculate driver charges
    let driverDailyRate = 0;
    let overtimeAmount = 0;
    let totalDriverCharges = 0;
    let overtimeHours = 0;

    if (selectedDriver) {
      driverDailyRate = formData.isOutstation 
        ? selectedDriver.driverRates.outstationDailyRate 
        : selectedDriver.driverRates.localDailyRate;

      const actualHours = parseFloat(formData.actualDutyHours) || 0;
      const thresholdHours = selectedDriver.driverRates.overtimeThresholdHours;
      overtimeHours = Math.max(0, actualHours - thresholdHours);
      
      overtimeAmount = overtimeHours * selectedDriver.driverRates.overtimeHourlyRate;
      totalDriverCharges = (driverDailyRate * totalDays) + overtimeAmount;
    }

    // Calculate vendor charges for outsourced vehicles
    let vendorDailyRate = 0;
    let totalVendorCharges = 0;
    if (selectedVehicle.vehicleType === 'Outsourced-in' && selectedVehicle.vendorInfo) {
      vendorDailyRate = selectedVehicle.vendorInfo.dailyVendorRate;
      totalVendorCharges = vendorDailyRate * totalDays;
    }

    // Calculate tax deduction
    const taxPercentage = parseFloat(formData.taxDeductionPercentage) || 0;
    const taxDeductionAmount = (totalRent * taxPercentage) / 100;

    // Calculate mileage
    const startMileage = parseFloat(formData.startMileage) || 0;
    const endMileage = parseFloat(formData.endMileage) || 0;
    const mileageUsed = Math.max(0, endMileage - startMileage);

    // Final amount calculation
    const finalAmount = totalRent + totalDriverCharges - taxDeductionAmount;

    setCalculations({
      totalDays,
      rentPerDay,
      totalRent,
      driverDailyRate,
      overtimeHours,
      overtimeAmount,
      totalDriverCharges,
      vendorDailyRate,
      totalVendorCharges,
      taxDeductionAmount,
      finalAmount,
      mileageUsed
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.customerId) {
      showAlert('Please select a customer', 'error');
      return;
    }
    if (!formData.vehicleId) {
      showAlert('Please select a vehicle', 'error');
      return;
    }
    if (!formData.startDate) {
      showAlert('Please select a start date', 'error');
      return;
    }
    if (!formData.endDate) {
      showAlert('Please select an end date', 'error');
      return;
    }
    if (!formData.rentalType) {
      showAlert('Please select a rental type', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const bookingData = {
        customer: formData.customerId,
        vehicle: formData.vehicleId,
        driver: formData.driverId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        routeName: formData.routeName,
        showroomContactPerson: {
          name: formData.showroomContactName,
          phone: formData.showroomContactPhone
        },
        bookingContactPerson: {
          name: formData.bookingContactName,
          phone: formData.bookingContactPhone
        },
        dutyHours: {
          scheduled: parseFloat(formData.scheduledDutyHours),
          actual: parseFloat(formData.actualDutyHours),
          overtime: calculations.overtimeHours
        },
        mileage: {
          start: parseFloat(formData.startMileage) || 0,
          end: parseFloat(formData.endMileage) || 0,
          total: calculations.mileageUsed
        },
        isOutstation: formData.isOutstation,
        rentalType: formData.rentalType,
        rentPerDay: calculations.rentPerDay,
        totalDays: calculations.totalDays,
        totalRent: calculations.totalRent,
        driverCharges: {
          dailyRate: calculations.driverDailyRate,
          overtimeAmount: calculations.overtimeAmount,
          totalAmount: calculations.totalDriverCharges
        },
        vendorCharges: calculations.totalVendorCharges > 0 ? {
          dailyRate: calculations.vendorDailyRate,
          totalAmount: calculations.totalVendorCharges
        } : undefined,
        taxDeduction: {
          percentage: parseFloat(formData.taxDeductionPercentage) || 0,
          amount: calculations.taxDeductionAmount
        },
        payment: {
          totalAmount: calculations.finalAmount,
          receivedAmount: 0,
          balanceAmount: calculations.finalAmount,
          taxDeduction: calculations.taxDeductionAmount,
          securityDeposit: 0
        },
        status: formData.status,
        notes: formData.notes
      };

      if (editingBooking) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/bookings/${editingBooking._id}`, bookingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Booking updated successfully', 'success');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/bookings`, bookingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Booking created successfully', 'success');
      }

      fetchBookings();
      handleClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      showAlert('Failed to save booking', 'error');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBooking(null);
    setFormData({
      customerId: '',
      vehicleId: '',
      driverId: '',
      startDate: '',
      endDate: '',
      routeName: '',
      showroomContactName: '',
      showroomContactPhone: '',
      bookingContactName: '',
      bookingContactPhone: '',
      scheduledDutyHours: '12',
      actualDutyHours: '0',
      startMileage: '',
      endMileage: '',
      isOutstation: false,
      rentalType: 'Own',
      taxDeductionPercentage: '0',
      status: 'confirmed',
      notes: ''
    });
    setCalculations({
      totalDays: 0,
      rentPerDay: 0,
      totalRent: 0,
      driverDailyRate: 0,
      overtimeHours: 0,
      overtimeAmount: 0,
      totalDriverCharges: 0,
      vendorDailyRate: 0,
      totalVendorCharges: 0,
      taxDeductionAmount: 0,
      finalAmount: 0,
      mileageUsed: 0
    });
  };

  const handleEdit = (booking: Booking) => {
    console.log('=== Edit Booking Debug ===');
    console.log('Booking object:', booking);
    console.log('Customer:', booking.customer);
    console.log('Vehicle:', booking.vehicle);
    console.log('Driver:', booking.driver);
    
    // Validate required booking data
    if (!booking || !booking._id) {
      showAlert('Invalid booking data', 'error');
      return;
    }
    
    if (!booking.customer || !booking.customer._id) {
      showAlert('Booking missing customer information', 'error');
      return;
    }
    
    setEditingBooking(booking);
    setFormData({
      customerId: booking.customer?._id || '',
      vehicleId: booking.vehicle?._id || '',
      driverId: booking.driver?._id || '',
      startDate: booking.startDate ? booking.startDate.split('T')[0] : '',
      endDate: booking.endDate ? booking.endDate.split('T')[0] : '',
      routeName: booking.routeName || '',
      showroomContactName: booking.showroomContactPerson?.name || '',
      showroomContactPhone: booking.showroomContactPerson?.phone || '',
      bookingContactName: booking.bookingContactPerson?.name || '',
      bookingContactPhone: booking.bookingContactPerson?.phone || '',
      scheduledDutyHours: booking.dutyHours?.scheduled?.toString() || '12',
      actualDutyHours: booking.dutyHours?.actual?.toString() || '0',
      startMileage: booking.mileage?.start?.toString() || '0',
      endMileage: booking.mileage?.end?.toString() || '0',
      isOutstation: booking.isOutstation || false,
      rentalType: booking.vehicle ? 'Own' : 'Outsourced',
      taxDeductionPercentage: booking.taxDeduction?.percentage?.toString() || '0',
      status: booking.status || 'confirmed',
      notes: booking.notes || ''
    });
    
    // Set calculations from existing booking with null checks
    const calculatedFinalAmount = booking.finalAmount || 
      ((booking.totalRent || 0) + (booking.driverCharges?.totalAmount || 0) - (booking.taxDeduction?.amount || 0));
    
    setCalculations({
      totalDays: booking.totalDays || 0,
      rentPerDay: booking.rentPerDay || 0,
      totalRent: booking.totalRent || 0,
      driverDailyRate: booking.driverCharges?.dailyRate || 0,
      overtimeHours: booking.dutyHours?.overtime || 0,
      overtimeAmount: booking.driverCharges?.overtimeAmount || 0,
      totalDriverCharges: booking.driverCharges?.totalAmount || 0,
      vendorDailyRate: booking.vendorCharges?.dailyRate || 0,
      totalVendorCharges: booking.vendorCharges?.totalAmount || 0,
      taxDeductionAmount: booking.taxDeduction?.amount || 0,
      finalAmount: calculatedFinalAmount,
      mileageUsed: booking.mileage?.total || 0
    });
    
    setOpen(true);
  };

  const handleDelete = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        showAlert('Booking deleted successfully', 'success');
        fetchBookings(); // Refresh the list
      } catch (error) {
        console.error('Error deleting booking:', error);
        showAlert('Failed to delete booking', 'error');
      }
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      case 'in_progress': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Enhanced Booking Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Create Booking
        </Button>
      </Stack>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => {
              // Add safety checks for booking data
              if (!booking || !booking._id) {
                console.warn('Invalid booking found:', booking);
                return null;
              }
              
              return (
                <TableRow key={booking._id}>
                  <TableCell>{booking.bookingNumber || 'N/A'}</TableCell>
                  <TableCell>{booking.customer?.name || 'Unknown Customer'}</TableCell>
                  <TableCell>
                    {booking.vehicle?.make || 'Unknown'} {booking.vehicle?.model || ''}
                    <br />
                    <small>{booking.vehicle?.registrationNumber || 'N/A'}</small>
                  </TableCell>
                  <TableCell>{booking.driver?.name || 'No Driver'}</TableCell>
                  <TableCell>{booking.routeName || 'N/A'}</TableCell>
                  <TableCell>
                    {booking.totalDays || 0} days
                    <br />
                    <small>
                      {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} - {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
                    </small>
                  </TableCell>
                  <TableCell>${(booking.totalRent || 0) + (booking.driverCharges?.totalAmount || 0)}</TableCell>
                  <TableCell>
                    <Chip
                      label={(booking.status || 'unknown').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      color={getStatusColor(booking.status || 'unknown') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEdit(booking)}
                      disabled={!booking.customer?._id} // Disable if no customer data
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(booking._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingBooking ? 'Edit Booking' : 'Create New Booking'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Customer *</InputLabel>
                      <Select
                        value={formData.customerId}
                        label="Customer *"
                        onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                      >
                        {customers.map(customer => (
                          <MenuItem key={customer._id} value={customer._id}>
                            {customer.name} ({customer.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel>Vehicle *</InputLabel>
                      <Select
                        value={formData.vehicleId}
                        label="Vehicle *"
                        onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                      >
                        {vehicles.map(vehicle => (
                          <MenuItem key={vehicle._id} value={vehicle._id}>
                            {vehicle.make} {vehicle.model} ({vehicle.registrationNumber}) - ${vehicle.dailyRate}/day
                            {vehicle.vehicleType === 'Outsourced-in' && ` [Outsourced]`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Driver</InputLabel>
                      <Select
                        value={formData.driverId}
                        label="Driver"
                        onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                      >
                        <MenuItem value="">No Driver</MenuItem>
                        {drivers.map(driver => (
                          <MenuItem key={driver._id} value={driver._id}>
                            {driver.name} - Local: ${driver.driverRates.localDailyRate}, Outstation: ${driver.driverRates.outstationDailyRate}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Route Name"
                      value={formData.routeName}
                      onChange={(e) => setFormData({...formData, routeName: e.target.value})}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Rental Type *</InputLabel>
                      <Select
                        value={formData.rentalType}
                        label="Rental Type *"
                        onChange={(e) => setFormData({...formData, rentalType: e.target.value})}
                      >
                        <MenuItem value="Own">Own Fleet</MenuItem>
                        <MenuItem value="Outsourced From Vendor">Outsourced From Vendor</MenuItem>
                        <MenuItem value="Outsourced To Client">Outsourced To Client</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date *"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date *"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isOutstation}
                          onChange={(e) => setFormData({...formData, isOutstation: e.target.checked})}
                        />
                      }
                      label="Outstation Trip"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Contact Information</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Showroom Contact Name"
                      value={formData.showroomContactName}
                      onChange={(e) => setFormData({...formData, showroomContactName: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      label="Showroom Contact Phone"
                      value={formData.showroomContactPhone}
                      onChange={(e) => setFormData({...formData, showroomContactPhone: e.target.value})}
                    />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Booking Contact Name"
                      value={formData.bookingContactName}
                      onChange={(e) => setFormData({...formData, bookingContactName: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      label="Booking Contact Phone"
                      value={formData.bookingContactPhone}
                      onChange={(e) => setFormData({...formData, bookingContactPhone: e.target.value})}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Duty Hours & Mileage */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Duty Hours & Mileage Tracking</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Scheduled Duty Hours"
                      value={formData.scheduledDutyHours}
                      onChange={(e) => setFormData({...formData, scheduledDutyHours: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Actual Duty Hours"
                      value={formData.actualDutyHours}
                      onChange={(e) => setFormData({...formData, actualDutyHours: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Tax Deduction %"
                      value={formData.taxDeductionPercentage}
                      onChange={(e) => setFormData({...formData, taxDeductionPercentage: e.target.value})}
                    />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Start Mileage (km)"
                      value={formData.startMileage}
                      onChange={(e) => setFormData({...formData, startMileage: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="End Mileage (km)"
                      value={formData.endMileage}
                      onChange={(e) => setFormData({...formData, endMileage: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      label="Mileage Used"
                      value={`${calculations.mileageUsed} km`}
                      slotProps={{ input: { readOnly: true } }}
                      variant="filled"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Automatic Calculations */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CalculateIcon sx={{ mr: 1 }} />
                  Automatic Calculations
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Total Days"
                    value={calculations.totalDays}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                  />
                  <TextField
                    label="Rent Per Day"
                    value={`$${calculations.rentPerDay}`}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                  />
                  <TextField
                    label="Total Rent"
                    value={`$${calculations.totalRent}`}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                  />
                  <TextField
                    label="Driver Daily Rate"
                    value={`$${calculations.driverDailyRate}`}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                  />
                  <TextField
                    label="Overtime Hours"
                    value={calculations.overtimeHours}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                  />
                  <TextField
                    label="Overtime Amount"
                    value={`$${calculations.overtimeAmount}`}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                  />
                  <TextField
                    label="Total Driver Charges"
                    value={`$${calculations.totalDriverCharges}`}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                  />
                  <TextField
                    label="Tax Deduction"
                    value={`$${calculations.taxDeductionAmount}`}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                  />
                  <TextField
                    label="Final Amount"
                    value={`$${calculations.finalAmount}`}
                    slotProps={{ input: { readOnly: true } }}
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                {calculations.totalVendorCharges > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Outsourced Vehicle Charges:</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <TextField
                        label="Vendor Daily Rate"
                        value={`$${calculations.vendorDailyRate}`}
                        slotProps={{ input: { readOnly: true } }}
                        variant="filled"
                        size="small"
                      />
                      <TextField
                        label="Total Vendor Charges"
                        value={`$${calculations.totalVendorCharges}`}
                        slotProps={{ input: { readOnly: true } }}
                        variant="filled"
                        size="small"
                      />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Status & Notes */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.customerId || !formData.vehicleId || !formData.startDate || !formData.endDate}
          >
            {editingBooking ? 'Update' : 'Create'} Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
