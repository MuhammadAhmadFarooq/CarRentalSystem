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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

interface OutsourcedVehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vendorName: string;
  vendorContact: {
    phone: string;
    email: string;
    address: string;
  };
  dailyRate: number;
  securityDeposit: number;
  contractStartDate: string;
  contractEndDate: string;
  status: string;
  notes: string;
  createdAt: string;
}

export default function OutsourcedVehicleManagement() {
  const [vehicles, setVehicles] = useState<OutsourcedVehicle[]>([]);
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<OutsourcedVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNumber: '',
    vendorName: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorAddress: '',
    dailyRate: '',
    securityDeposit: '',
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/outsourced-vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const vehicleData = {
        ...formData,
        year: Number(formData.year),
        dailyRate: Number(formData.dailyRate),
        securityDeposit: Number(formData.securityDeposit),
        vendorContact: {
          phone: formData.vendorPhone,
          email: formData.vendorEmail,
          address: formData.vendorAddress
        }
      };

      if (editingVehicle) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/outsourced-vehicles/${editingVehicle._id}`, vehicleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/outsourced-vehicles`, vehicleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchVehicles();
      handleClose();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setError('Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle: OutsourcedVehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      registrationNumber: vehicle.registrationNumber,
      vendorName: vehicle.vendorName,
      vendorPhone: vehicle.vendorContact?.phone || '',
      vendorEmail: vehicle.vendorContact?.email || '',
      vendorAddress: vehicle.vendorContact?.address || '',
      dailyRate: vehicle.dailyRate.toString(),
      securityDeposit: vehicle.securityDeposit.toString(),
      contractStartDate: vehicle.contractStartDate.split('T')[0],
      contractEndDate: vehicle.contractEndDate ? vehicle.contractEndDate.split('T')[0] : '',
      status: vehicle.status,
      notes: vehicle.notes
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/outsourced-vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setError('Failed to delete vehicle');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingVehicle(null);
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      registrationNumber: '',
      vendorName: '',
      vendorPhone: '',
      vendorEmail: '',
      vendorAddress: '',
      dailyRate: '',
      securityDeposit: '',
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: '',
      status: 'active',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'returned': return 'info';
      case 'extended': return 'warning';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Outsourced Vehicle Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Outsourced Vehicle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell>Registration Number</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Daily Rate</TableCell>
              <TableCell>Security Deposit</TableCell>
              <TableCell>Contract Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </Typography>
                </TableCell>
                <TableCell>{vehicle.registrationNumber}</TableCell>
                <TableCell>{vehicle.vendorName}</TableCell>
                <TableCell>
                  <Typography variant="body2">{vehicle.vendorContact?.phone}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehicle.vendorContact?.email}
                  </Typography>
                </TableCell>
                <TableCell>${vehicle.dailyRate}/day</TableCell>
                <TableCell>${vehicle.securityDeposit}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(vehicle.contractStartDate).toLocaleDateString()}
                  </Typography>
                  {vehicle.contractEndDate && (
                    <Typography variant="body2" color="text.secondary">
                      to {new Date(vehicle.contractEndDate).toLocaleDateString()}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                    color={getStatusColor(vehicle.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(vehicle)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(vehicle._id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {vehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No outsourced vehicles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVehicle ? 'Edit Outsourced Vehicle' : 'Add New Outsourced Vehicle'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="h6" color="primary">Vehicle Information</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              />
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              />
              <TextField
                fullWidth
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </Stack>
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="returned">Returned</MenuItem>
                <MenuItem value="extended">Extended</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Vendor Information</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Vendor Name"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Phone"
                value={formData.vendorPhone}
                onChange={(e) => setFormData({ ...formData, vendorPhone: e.target.value })}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.vendorEmail}
                onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
              />
              <TextField
                fullWidth
                label="Address"
                value={formData.vendorAddress}
                onChange={(e) => setFormData({ ...formData, vendorAddress: e.target.value })}
              />
            </Stack>

            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Contract & Financial Information</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Daily Rate ($)"
                type="number"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
              />
              <TextField
                fullWidth
                label="Security Deposit ($)"
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Contract Start Date"
                type="date"
                value={formData.contractStartDate}
                onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Contract End Date (Optional)"
                type="date"
                value={formData.contractEndDate}
                onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingVehicle ? 'Update' : 'Create'} Vehicle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
