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
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Customer {
  _id: string;
  name: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  type: 'individual' | 'company';
  licenseNumber?: string;
  licenseExpiryDate?: string;
  cnic?: string;
  companyRegistration?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  status: string;
  totalBookings: number;
  totalAmountPaid: number;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'individual' as 'individual' | 'company',
    licenseNumber: '',
    licenseExpiryDate: '',
    companyRegistrationNumber: '',
    contactPersonName: '',
    contactPersonPhone: '',
    status: 'active'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Transform the data to match the expected schema structure
      const customerData = {
        type: formData.type,
        name: formData.name,
        contact: {
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        },
        status: formData.status,
        ...(formData.type === 'individual' ? {
          licenseNumber: formData.licenseNumber,
          cnic: formData.licenseNumber // Using license as CNIC for now
        } : {
          companyRegistration: formData.companyRegistrationNumber
        })
      };
      
      if (editingCustomer) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/customers/${editingCustomer._id}`, customerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/customers`, customerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchCustomers();
      handleClose();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.contact?.email || '',
      phone: customer.contact?.phone || '',
      address: customer.contact?.address || '',
      type: customer.type,
      licenseNumber: customer.licenseNumber || '',
      licenseExpiryDate: customer.licenseExpiryDate ? customer.licenseExpiryDate.split('T')[0] : '',
      companyRegistrationNumber: customer.companyRegistration || '',
      contactPersonName: customer.contactPersonName || '',
      contactPersonPhone: customer.contactPersonPhone || '',
      status: customer.status
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'individual',
      licenseNumber: '',
      licenseExpiryDate: '',
      companyRegistrationNumber: '',
      contactPersonName: '',
      contactPersonPhone: '',
      status: 'active'
    });
  };

  const filteredCustomers = customers.filter(customer => 
    currentTab === 0 ? customer.type === 'individual' : customer.type === 'company'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Customer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Customer
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<PersonIcon />} label="Individual Customers" />
          <Tab icon={<BusinessIcon />} label="Company Customers" />
        </Tabs>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              {currentTab === 0 && <TableCell>License Number</TableCell>}
              {currentTab === 1 && <TableCell>Registration Number</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell>Total Bookings</TableCell>
              <TableCell>Total Spent</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.contact?.email || 'N/A'}</TableCell>
                <TableCell>{customer.contact?.phone || 'N/A'}</TableCell>
                {currentTab === 0 && <TableCell>{customer.licenseNumber || 'N/A'}</TableCell>}
                {currentTab === 1 && <TableCell>{customer.companyRegistration || 'N/A'}</TableCell>}
                <TableCell>
                  <Chip
                    label={customer.status}
                    color={getStatusColor(customer.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{customer.totalBookings || 0}</TableCell>
                <TableCell>₹{customer.totalAmountPaid || 0}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(customer)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(customer._id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No {currentTab === 0 ? 'individual' : 'company'} customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Customer Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'individual' | 'company' })}
                >
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label={formData.type === 'company' ? 'Company Name' : 'Full Name'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              />
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Stack>

            {formData.type === 'individual' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="License Expiry Date"
                  type="date"
                  value={formData.licenseExpiryDate}
                  onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
            )}

            {formData.type === 'company' && (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Company Registration Number"
                  value={formData.companyRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, companyRegistrationNumber: e.target.value })}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Contact Person Name"
                    value={formData.contactPersonName}
                    onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Contact Person Phone"
                    value={formData.contactPersonPhone}
                    onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                  />
                </Stack>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCustomer ? 'Update' : 'Add'} Customer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
