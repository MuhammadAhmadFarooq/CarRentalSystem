<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Car Rental Admin System - Copilot Instructions

This is a MERN stack application for a car rental admin system with the following architecture:

## Project Structure
- `/server` - Node.js/Express backend with MongoDB
- `/client` - React TypeScript frontend with Material-UI

## Key Features to Implement
1. Dashboard with monthly metrics and summaries
2. Vehicle Management (own fleet and outsourced vehicles)
3. Customer Management (individuals and companies)
4. Driver Management with expense tracking
5. Booking & Rental Tracking with comprehensive logging
6. Manual Expense Logging
7. Payments & Balances tracking
8. Excel export functionality for reports

## Technical Guidelines
- Use TypeScript for type safety
- Material-UI for consistent, responsive design
- Mongoose for MongoDB schemas
- JWT for authentication
- Excel export using xlsx library
- Responsive design for desktop and mobile
- Clean, minimal UI design

## Data Models
- Vehicle (own fleet)
- OutsourcedVehicle
- Customer
- Driver
- Booking
- Expense
- Payment

## API Endpoints
Follow RESTful conventions with proper error handling and validation.
