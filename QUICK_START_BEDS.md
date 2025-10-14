# Quick Start - Hospital Bed Booking

## Setup Instructions

### 1. Add Environment Variable
Add this line to your `.env` file:
```
DB_BEDS_COLLECTION=beds
```

### 2. Initialize Hospital Beds
Run the seeding script to create 10 hospital beds:
```bash
npm run seed:beds
```

This will create:
- 2 beds in General Ward (Beds 1-2)
- 2 beds in ICU (Beds 3-4)
- 2 beds in Emergency (Beds 5-6)
- 2 beds in Surgery (Beds 7-8)
- 2 beds in Pediatrics (Beds 9-10)

### 3. Start the Server
```bash
npm run dev
```

## How to Use

### 1. View All Available Beds
```http
GET http://localhost:3000/beds
```

### 2. Check Available Beds for a Time Slot
```http
GET http://localhost:3000/beds/available?appointmentDate=2025-10-15&appointmentStartTime=09:00&appointmentEndTime=11:00
```

### 3. Create Appointment with Bed
```http
POST http://localhost:3000/appointments
Content-Type: application/json

{
  "patientId": "your_patient_id",
  "doctorId": "your_doctor_id",
  "serviceId": "your_service_id",
  "bedId": "bed_id_from_available_beds",
  "appointmentDate": "2025-10-15",
  "appointmentStartTime": "09:00",
  "appointmentEndTime": "11:00",
  "note": "Patient needs bed rest"
}
```

The system will automatically:
- ✅ Check if the bed is available
- ✅ Prevent double booking
- ✅ Return error if bed is already occupied

### 4. View Appointments with Bed Info
```http
GET http://localhost:3000/appointments/:appointment_id
```

Response includes bed information:
```json
{
  "appointment": {
    "patientId": "...",
    "bedId": "...",
    "bed": [{
      "bedNumber": 1,
      "bedName": "Bed 1 - General Ward",
      "department": "General"
    }]
  }
}
```

## Full API Documentation

See `BED_MANAGEMENT_GUIDE.md` for complete API documentation and advanced features.
