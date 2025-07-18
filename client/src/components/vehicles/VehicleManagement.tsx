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
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  color: string;
  vehicleType: string;
  vendorInfo?: {
    vendorName?: string;
    vendorContact?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    dailyVendorRate?: number;
  };
  dailyRate: number;
  status: string;
  mileage: number;
}

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    registrationNumber: '',
    color: '',
    vehicleType: 'Company-owned',
    vendorName: '',
    vendorContact: '',
    contractStartDate: '',
    contractEndDate: '',
    dailyVendorRate: '',
    dailyRate: '',
    status: 'available',
    mileage: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = {
        ...formData,
        year: parseInt(formData.year),
        dailyRate: parseFloat(formData.dailyRate),
        mileage: parseInt(formData.mileage),
        vendorInfo: formData.vehicleType === 'Outsourced-in' ? {
          vendorName: formData.vendorName,
          vendorContact: formData.vendorContact,
          contractStartDate: formData.contractStartDate,
          contractEndDate: formData.contractEndDate,
          dailyVendorRate: parseFloat(formData.dailyVendorRate) || 0
        } : undefined
      };

      if (editingVehicle) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/vehicles/${editingVehicle._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/vehicles`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchVehicles();
      handleClose();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      registrationNumber: vehicle.registrationNumber,
      color: vehicle.color,
      vehicleType: vehicle.vehicleType,
      vendorName: vehicle.vendorInfo?.vendorName || '',
      vendorContact: vehicle.vendorInfo?.vendorContact || '',
      contractStartDate: vehicle.vendorInfo?.contractStartDate || '',
      contractEndDate: vehicle.vendorInfo?.contractEndDate || '',
      dailyVendorRate: vehicle.vendorInfo?.dailyVendorRate?.toString() || '',
      dailyRate: vehicle.dailyRate.toString(),
      status: vehicle.status,
      mileage: vehicle.mileage.toString()
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingVehicle(null);
    setFormData({
      make: '',
      model: '',
      year: '',
      registrationNumber: '',
      color: '',
      vehicleType: 'Company-owned',
      vendorName: '',
      vendorContact: '',
      contractStartDate: '',
      contractEndDate: '',
      dailyVendorRate: '',
      dailyRate: '',
      status: 'available',
      mileage: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'booked': return 'primary';
      case 'under_maintenance': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Vehicle Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Vehicle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Make/Model</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Registration Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Daily Rate</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.registrationNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={vehicle.vehicleType}
                    color={vehicle.vehicleType === 'Company-owned' ? 'success' : 
                           vehicle.vehicleType === 'Outsourced-in' ? 'warning' : 'info'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={vehicle.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    color={getStatusColor(vehicle.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>₹{vehicle.dailyRate}/day</TableCell>
                <TableCell>
                  {vehicle.vendorInfo?.vendorName || '-'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(vehicle)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(vehicle._id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {vehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No vehicles found. Add your first vehicle to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
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
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
              <TextField
                fullWidth
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={formData.vehicleType}
                  label="Vehicle Type"
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <MenuItem value="Company-owned">Company-owned</MenuItem>
                  <MenuItem value="Outsourced-in">Outsourced-in</MenuItem>
                  <MenuItem value="Outsourced-out">Outsourced-out</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            {formData.vehicleType === 'Outsourced-in' && (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Vendor Name"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Vendor Contact"
                    value={formData.vendorContact}
                    onChange={(e) => setFormData({ ...formData, vendorContact: e.target.value })}
                  />
                </Stack>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Contract Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Contract End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  />
                </Stack>
                
                <TextField
                  fullWidth
                  label="Daily Vendor Rate"
                  type="number"
                  value={formData.dailyVendorRate}
                  onChange={(e) => setFormData({ ...formData, dailyVendorRate: e.target.value })}
                />
              </>
            )}
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Daily Rate"
                type="number"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="booked">Booked</MenuItem>
                  <MenuItem value="under_maintenance">Under Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            <TextField
              fullWidth
              label="Current Mileage"
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingVehicle ? 'Update' : 'Add'} Vehicle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
