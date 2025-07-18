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
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Driver {
  _id: string;
  name: string;
  cnic: string;
  licenseNumber: string;
  contact: {
    phone: string;
    email?: string;
    address?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  driverRates: {
    localDailyRate: number;
    outstationDailyRate: number;
    overtimeThresholdHours: number;
    overtimeHourlyRate: number;
  };
  allowances: {
    monthlyParkingAllowance: number;
    nightFoodAllowance: number;
    outstationAllowance: number;
  };
  status: string;
  joiningDate: string;
}

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [open, setOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    localDailyRate: '1000',
    outstationDailyRate: '1500',
    overtimeThresholdHours: '12',
    overtimeHourlyRate: '200',
    monthlyParkingAllowance: '2000',
    nightFoodAllowance: '500',
    outstationAllowance: '1000',
    status: 'active',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!formData.cnic.trim()) {
      alert('CNIC is required');
      return;
    }
    if (!formData.licenseNumber.trim()) {
      alert('License Number is required');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Phone is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = {
        name: formData.name,
        cnic: formData.cnic,
        licenseNumber: formData.licenseNumber,
        contact: {
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation
        },
        driverRates: {
          localDailyRate: parseFloat(formData.localDailyRate),
          outstationDailyRate: parseFloat(formData.outstationDailyRate),
          overtimeThresholdHours: parseFloat(formData.overtimeThresholdHours),
          overtimeHourlyRate: parseFloat(formData.overtimeHourlyRate)
        },
        allowances: {
          monthlyParkingAllowance: parseFloat(formData.monthlyParkingAllowance),
          nightFoodAllowance: parseFloat(formData.nightFoodAllowance),
          outstationAllowance: parseFloat(formData.outstationAllowance)
        },
        status: formData.status,
        joiningDate: formData.joiningDate
      };

      if (editingDriver) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/drivers/${editingDriver._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/drivers`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchDrivers();
      handleClose();
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/drivers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
      }
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      cnic: driver.cnic,
      licenseNumber: driver.licenseNumber,
      phone: driver.contact.phone,
      email: driver.contact.email || '',
      address: driver.contact.address || '',
      emergencyContactName: driver.emergencyContact?.name || '',
      emergencyContactPhone: driver.emergencyContact?.phone || '',
      emergencyContactRelation: driver.emergencyContact?.relation || '',
      localDailyRate: driver.driverRates.localDailyRate.toString(),
      outstationDailyRate: driver.driverRates.outstationDailyRate.toString(),
      overtimeThresholdHours: driver.driverRates.overtimeThresholdHours.toString(),
      overtimeHourlyRate: driver.driverRates.overtimeHourlyRate.toString(),
      monthlyParkingAllowance: driver.allowances.monthlyParkingAllowance.toString(),
      nightFoodAllowance: driver.allowances.nightFoodAllowance.toString(),
      outstationAllowance: driver.allowances.outstationAllowance.toString(),
      status: driver.status,
      joiningDate: driver.joiningDate ? driver.joiningDate.split('T')[0] : ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDriver(null);
    setFormData({
      name: '',
      cnic: '',
      licenseNumber: '',
      phone: '',
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      localDailyRate: '1000',
      outstationDailyRate: '1500',
      overtimeThresholdHours: '12',
      overtimeHourlyRate: '200',
      monthlyParkingAllowance: '2000',
      nightFoodAllowance: '500',
      outstationAllowance: '1000',
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'on_leave': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Driver Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Driver
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>CNIC</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>License Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rates</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver._id}>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.cnic}</TableCell>
                <TableCell>{driver.contact.phone}</TableCell>
                <TableCell>{driver.licenseNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={driver.status.replace('_', ' ')}
                    color={getStatusColor(driver.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>${driver.driverRates.localDailyRate}/day (Local)</TableCell>
                <TableCell>{new Date(driver.joiningDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(driver)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(driver._id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {drivers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No drivers found. Add your first driver to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDriver ? 'Edit Driver' : 'Add New Driver'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="CNIC"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                required
                placeholder="e.g., 12345-1234567-1"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Join Date"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Local Daily Rate ($)"
                type="number"
                value={formData.localDailyRate}
                onChange={(e) => setFormData({ ...formData, localDailyRate: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Outstation Daily Rate ($)"
                type="number"
                value={formData.outstationDailyRate}
                onChange={(e) => setFormData({ ...formData, outstationDailyRate: e.target.value })}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Overtime Threshold Hours"
                type="number"
                value={formData.overtimeThresholdHours}
                onChange={(e) => setFormData({ ...formData, overtimeThresholdHours: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Overtime Hourly Rate ($)"
                type="number"
                value={formData.overtimeHourlyRate}
                onChange={(e) => setFormData({ ...formData, overtimeHourlyRate: e.target.value })}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Monthly Parking Allowance ($)"
                type="number"
                value={formData.monthlyParkingAllowance}
                onChange={(e) => setFormData({ ...formData, monthlyParkingAllowance: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Night Food Allowance ($)"
                type="number"
                value={formData.nightFoodAllowance}
                onChange={(e) => setFormData({ ...formData, nightFoodAllowance: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Outstation Allowance ($)"
                type="number"
                value={formData.outstationAllowance}
                onChange={(e) => setFormData({ ...formData, outstationAllowance: e.target.value })}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDriver ? 'Update' : 'Add'} Driver
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
