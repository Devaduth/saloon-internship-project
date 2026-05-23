# Salon Management App

Modern MERN stack starter for salon slot booking. Customers browse salons, view salon details and stylists, select services and pick available time slots at the salon to confirm appointments.

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

- Salon endpoints:
  - `GET /api/salons` — list salons
  - `GET /api/salons/:id` — salon details
  - `GET /api/salons/:id/stylists` — stylists at a salon
  - `GET /api/salons/:id/slots?date=YYYY-MM-DD` — available slots

- Booking endpoints:
  - `POST /api/bookings` — create a booking (protected)
  - `GET /api/bookings/customer/:customerId` — list bookings for customer (protected)

Example booking payload:

```json
{
  "salon_id": "<salonId>",
  "stylist_id": "<stylistId>",
  "slot_id": "<slotId>",
  "service_ids": ["svc-1", "svc-2"]
}
```

The server will reserve the slot and create a booking record with `booking_status` set to `CONFIRMED` when successful.

## Notes

- `status` defaults to `AA`.
- `created_at` and `modified_at` are managed through MongoDB timestamps.
- The stylist listing screen is included as a ready-to-expand placeholder.
