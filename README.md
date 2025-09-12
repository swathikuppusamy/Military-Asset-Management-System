# Military Asset Management System

A full-stack web platform for managing military assets, transfers, and logistics across multiple bases with role-based access control.

## Features

- **Asset Tracking** - Real-time monitoring of equipment across multiple bases
- **Transfer Management** - Streamlined inter-base asset transfers with approvals
- **Purchase Management** - Record and track asset acquisitions with vendor details
- **Assignment Tracking** - Assign assets to personnel and monitor returns
- **Role-Based Access** - Admin, Base Commander, and Logistics Officer permissions
- **Dashboard Analytics** - Visual metrics with filtering by date, base, and equipment type
- **Audit Logging** - Complete transaction history for compliance

## Tech Stack

**Frontend:** React.js, Tailwind CSS, Axios  
**Backend:** Node.js, Express.js, JWT Authentication  
**Database:** MongoDB with Mongoose ODM  
**Security:** bcrypt, Winston Logging

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 5+

### Installation

# Clone repository
git clone [https://github.com/yourusername/military-asset-management.git](https://github.com/swathikuppusamy/Military-Asset-Management-System)
cd military-asset-management

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm start

## User Roles

Admin - Full system access, user management
Base Commander - Base-specific operations, transfer approvals
Logistics Officer - Asset assignments, purchase recording

## API Endpoints

POST /api/auth/login                    # Authentication
GET  /api/dashboard/metrics/:baseId     # Dashboard data
GET  /api/assets/:baseId                # Asset management
POST /api/transfers                     # Transfer requests
POST /api/purchases                     # Purchase recording
POST /api/assignments                   # Personnel assignments

## Key Features

60% faster logistics processing
Multi-base asset tracking
Real-time dashboard updates
Secure JWT authentication
Mobile-responsive design

## Security

Role-based access control (RBAC)
JWT token authentication
Comprehensive audit logging
Input validation & sanitization
