# Car Rental Admin Management System

A comprehensive MERN stack web application for managing a car rental business. This system provides a complete admin panel for tracking vehicles, customers, drivers, bookings, expenses, and payments.

## Features

### 🚗 Core Modules

1. **Dashboard Summary**
   - Monthly Income tracking
   - Total Trips (Current Month)
   - Outstanding Receivables
   - Outstanding Payables
   - Fuel & Toll Expenses (monthly)
   - Driver Expense Summary (OT, Food, Parking)

2. **Vehicle Management**
   - Add/Edit/Delete vehicles (Own Fleet)
   - Status tracking: Available, Booked, Under Maintenance
   - Maintenance logs with date, description, and cost
   - Vehicle history: bookings, mileage, expenses

3. **Outsourced Vehicle Tracking**
   - Log vendor-rented cars
   - Vendor information management
   - Track usage & payables
   - Contract management

4. **Customer Management**
   - Add Company or Individual customers
   - CNIC, License, Contact information
   - Document upload (License/CNIC)
   - Booking history per customer

5. **Driver Management**
   - Driver profiles with CNIC, License, Contact
   - Vehicle assignment
   - Expense tracking:
     - Overtime (200/hr after 12 hrs)
     - Food Allowance (500/night)
     - Outstation (2000/night)
     - Parking (2000/month per assigned car)
   - Driver trip logs

6. **Booking & Rental Tracking**
   - Manual booking creation
   - Car, driver, and customer assignment
   - Comprehensive logging:
     - Registration Number, Showroom Person
     - Rental Type: Own, Outsourced From Vendor, Outsourced To Client
     - Outstation toggle
     - Rent/day, Days, Mileage (Start–Return)
     - Fuel & Toll (manual entry)
     - Driver Allowance calculations
     - Payment tracking with balance
     - Tax deduction
     - Status management

7. **Manual Expense Logging**
   - Add expenses per booking
   - Categories: Fuel, Toll, Maintenance, etc.
   - Link to car/driver/booking
   - Receipt management

8. **Payments & Balances**
   - Receivables: from clients
   - Payables: to vendors
   - Balance tracking & payment status
   - Payment method tracking

9. **Reports (Excel Export)**
   - Monthly Rental Report (with filters)
   - Vehicle Summary (bookings, KM, service cost)
   - Driver Report (duty, OT, expenses)
   - Income vs. Expenses Summary
   - Mileage Summary by vehicle/trip

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **multer** for file uploads
- **xlsx** for Excel report generation
- **moment** for date handling

### Frontend
- **React** with TypeScript
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Axios** for HTTP requests
- **Responsive Design** for desktop and mobile

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd car-rental-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/car_rental_admin
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   PORT=5000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system or configure cloud MongoDB URI.

5. **Run the application**
   ```bash
   npm start
   ```

   This will start both the server (port 5000) and client (port 3000) concurrently.

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: ${process.env.REACT_APP_API_URL}

### Alternative Commands

- **Start server only**: `npm run server`
- **Start client only**: `npm run client`
- **Build for production**: `npm run build`

## Default Login

On first run, you'll need to register an admin user through the API or create one manually in the database.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Core Resources
- `/api/vehicles` - Vehicle management
- `/api/outsourced-vehicles` - Outsourced vehicle tracking
- `/api/customers` - Customer management
- `/api/drivers` - Driver management
- `/api/bookings` - Booking and rental tracking
- `/api/expenses` - Expense logging
- `/api/payments` - Payment and balance management
- `/api/dashboard` - Dashboard metrics
- `/api/reports` - Report generation

## Key Features Implementation

### Calculations
- **Mileage**: Automatic calculation (End - Start)
- **Balance**: Auto-calculated (Total - Received)
- **Driver Costs**: Automated based on rates
- **Income**: Monthly aggregation
- **Expenses**: Category-wise tracking

### Data Export
- All reports exportable to Excel format
- Filter options for date ranges
- Comprehensive data including financial summaries

### UI/UX
- **Clean, minimal design** using Material-UI
- **Responsive layout** for desktop and mobile
- **Single admin user** (owner-only access)
- **Manual logging** of all data (no automation/integration)

## Project Structure

```
car-rental-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Context providers
│   │   └── ...
├── server/                 # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── ...
├── .github/               # GitHub configuration
└── package.json          # Root package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.

---

**Car Rental Admin Management System** - Comprehensive solution for single-branch car rental business management.
