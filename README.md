# Salon Management App

Modern MERN stack starter for the salon home flow. Customers select a main category, choose a sub category, and create an appointment record in MongoDB before moving to the stylist listing screen.

## Stack

- Frontend: React, Vite, React Router, Axios, React Toastify
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas
- Validation: API and frontend checks for required fields and connectivity

## Structure

- `client/` React UI
- `server/` REST API

## Setup

1. Install dependencies from the repository root.
2. Create environment files from the examples.
3. Start both apps with the root dev script.

## Environment

Server variables:

- `PORT=5000`
- `MONGODB_URI=mongodb+srv://saloon:<db_password>@saloon.nhzipsx.mongodb.net/saloon?retryWrites=true&w=majority&appName=saloon`
- `CLIENT_URL=http://localhost:5173`

Client variables:

- `VITE_API_BASE_URL=http://localhost:5000/api`

## API

- `POST /api/appointments`

Payload:

```json
{
  "main_category": "Women",
  "sub_category": "Hair Care",
  "created_by": "guest-user"
}
```

Success response returns the saved appointment and message `You have successfully selected the main and sub category.`

## Notes

- `status` defaults to `AA`.
- `created_at` and `modified_at` are managed through MongoDB timestamps.
- The stylist listing screen is included as a ready-to-expand placeholder.
