# Gym Membership Management System

A comprehensive web-based gym membership management system that allows gym owners to efficiently manage members, track payments, monitor attendance, and get alerts for due memberships.

## 🎯 Features

### For Gym Owners
- **Owner Registration & Authentication** - Secure JWT-based authentication
- **Member Management** 
  - Add/Edit/Delete members with photos
  - Store complete member details (contact, emergency info, etc.)
  - Search and filter members
  - View detailed member profiles
  
- **Membership Tracking**
  - Multiple membership plans (Monthly, Quarterly, Half-Yearly, Yearly)
  - Track membership start/end dates
  - Automatic status updates (active/expired)
  - Renewal management
  
- **Payment Management**
  - Record payments with multiple methods (Cash, Card, UPI, Online)
  - View payment history per member
  - Track monthly revenue
  - Filter payments by date range
  
- **Attendance Tracking**
  - Quick check-in system
  - View today's attendance
  - Track member visit history
  - Attendance statistics
  
- **Due Members Dashboard**
  - Automatic alerts for expiring memberships
  - View all due members with photos and details
  - Contact information readily available
  - Next fee amount calculation
  
- **Dashboard Analytics**
  - Total/Active members count
  - Today's attendance
  - Monthly revenue
  - Due members count
  - Recent payments and upcoming dues

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **Prisma ORM** - Database toolkit
- **JWT** - Authentication
- **Multer** - File upload handling
- **Bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **React Hot Toast** - Notifications

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gym-management-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/gym_management?schema=public"
# JWT_SECRET="your-super-secret-jwt-key"
# PORT=5000

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
gym-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── memberController.js   # Member CRUD operations
│   │   ├── membershipController.js
│   │   ├── paymentController.js
│   │   ├── attendanceController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   └── upload.js             # File upload middleware
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── membershipRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── dashboardRoutes.js
│   ├── uploads/                  # Member photos storage
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js                 # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx        # Main layout with sidebar
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Members.jsx
    │   │   ├── AddMember.jsx
    │   │   ├── MemberDetails.jsx
    │   │   ├── DueMembers.jsx
    │   │   ├── Payments.jsx
    │   │   └── Attendance.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register gym owner
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (protected)

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create member (with photo upload)
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Memberships
- `POST /api/memberships` - Create membership
- `POST /api/memberships/renew` - Renew membership
- `GET /api/memberships/:memberId` - Get membership history

### Payments
- `POST /api/payments` - Record payment
- `GET /api/payments/all` - Get all payments
- `GET /api/payments/:memberId` - Get payment history

### Attendance
- `POST /api/attendance/checkin` - Check-in member
- `POST /api/attendance/checkout` - Check-out member
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/:memberId` - Get attendance history

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/due-members` - Get due members

## 💾 Database Schema

The system uses PostgreSQL with the following main tables:

- **gym_owners** - Gym owner accounts
- **members** - Member information
- **memberships** - Membership plans and durations
- **payments** - Payment transactions
- **attendance** - Check-in/check-out records

## 🎨 Key Features Implementation

### Due Members Alert System
The system automatically calculates and displays members whose memberships are:
- Expiring within the next 7 days (configurable)
- Already expired

Each due member card shows:
- Member photo, name, and contact details
- Current membership plan and expiry date
- Days until expiry (or "Expired" status)
- Next fee amount
- Quick contact options

### Membership Management
- Flexible membership plans with custom durations
- Automatic end date calculation
- Status tracking (active/expired/cancelled)
- Renewal with historical tracking

### Payment Tracking
- Multiple payment methods supported
- Date range filtering
- Revenue analytics
- Payment history per member

### Attendance System
- Quick check-in functionality
- Today's attendance view
- Historical attendance tracking
- Visit count per member

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- File upload validation
- Input sanitization
- SQL injection prevention (Prisma)

## 📱 Responsive Design

The frontend is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🚦 Getting Started (Quick Guide)

1. Set up PostgreSQL database
2. Configure `.env` file in backend
3. Run migrations: `npm run prisma:migrate`
4. Start backend: `npm run dev` (in backend folder)
5. Start frontend: `npm run dev` (in frontend folder)
6. Navigate to `http://localhost:3000`
7. Register as a gym owner
8. Start adding members!

## 📝 Default Membership Plans

The system comes with predefined plans:
- **Monthly**: 30 days - $50
- **Quarterly**: 90 days - $135
- **Half-Yearly**: 180 days - $250
- **Yearly**: 365 days - $480

These can be customized per member.

## 🤝 Support

For issues or questions, please create an issue in the repository.

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ for gym owners to manage their fitness businesses efficiently.
