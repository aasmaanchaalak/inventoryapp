# Inventory App - Lead Management System

A full-stack React application with Node.js/Express backend for managing leads with MongoDB database.

## Features

- **Frontend**: React with React Hook Form for lead creation
- **Backend**: Express.js API with MongoDB/Mongoose
- **Styling**: Tailwind CSS for modern UI
- **Validation**: Yup schema validation
- **Database**: MongoDB with Mongoose ODM

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository** (if applicable)
2. **Install dependencies**:
   ```bash
   npm install
   ```

## Setup

### 1. MongoDB Setup

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- The app will connect to `mongodb://localhost:27017/inventoryapp`

**Option B: MongoDB Atlas**
- Create a MongoDB Atlas account
- Create a cluster
- Get your connection string
- Update the `MONGODB_URI` in your environment variables

### 2. Environment Variables

Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventoryapp
NODE_ENV=development
```

### 3. Running the Application

**Development Mode (Frontend + Backend)**
```bash
npm run dev
```
This will start both the React frontend (port 3000) and Express backend (port 5000).

**Frontend Only**
```bash
npm start
```

**Backend Only**
```bash
npm run server
```

## API Endpoints

### POST /api/leads
Creates a new lead in the database.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "phone": "+1234567890",
  "productInterest": "electronics",
  "leadSource": "website",
  "notes": "Interested in latest smartphones"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead created successfully!",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "phone": "+1234567890",
    "product": "electronics",
    "source": "website",
    "notes": "Interested in latest smartphones",
    "createdAt": "2023-07-20T10:30:00.000Z",
    "formattedCreatedAt": "July 20, 2023 at 10:30 AM"
  }
}
```

### GET /api/leads
Retrieves all leads from the database.

### GET /api/leads/:id
Retrieves a specific lead by ID.

### GET /api/health
Health check endpoint for the API.

## Database Schema

### Lead Model
```javascript
{
  name: String (required, max 100 chars),
  phone: String (required, max 20 chars),
  product: String (required, enum),
  source: String (required, enum),
  notes: String (optional, max 1000 chars),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Product Categories:**
- electronics
- clothing
- home-garden
- sports
- books
- automotive
- health-beauty
- toys-games

**Lead Sources:**
- website
- social-media
- referral
- cold-call
- email-campaign
- trade-show
- advertising
- other

## Project Structure

```
inventoryapp/
├── backend/
│   ├── models/
│   │   └── Lead.js          # Mongoose schema
│   ├── routes/
│   │   └── leads.js         # API routes
│   └── server.js            # Express server
├── src/
│   ├── components/
│   │   └── LeadCreationForm.js  # React form component
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Technologies Used

- **Frontend**: React, React Hook Form, Yup, Tailwind CSS
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Development**: Concurrently (for running both servers)

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Database connection issues
- Duplicate entries
- Missing required fields
- Invalid data types

## Development

- Frontend runs on `http://localhost:3000`
- Backend API runs on `http://localhost:5000`
- MongoDB should be running on `mongodb://localhost:27017`

## Production

For production deployment:
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure CORS appropriately
4. Set up proper environment variables
5. Build the React app: `npm run build`

## License

MIT License
