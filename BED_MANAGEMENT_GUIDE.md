# Hospital Bed Management System - Implementation Guide

## Overview
This system allows customers to book appointments for 10 individual hospital beds. The implementation includes bed availability checking, conflict prevention, and complete CRUD operations.

## Changes Made

### 1. New Database Schema: Bed
**File**: `src/models/schemas/Bed.schema.ts`
- `bedNumber`: Unique identifier (1-10)
- `bedName`: Display name for the bed
- `department`: Optional department assignment
- `isAvailable`: Availability status
- `description`: Additional notes

### 2. Updated Appointment Schema
**File**: `src/models/schemas/Appointment.schema.ts`
- Added `bedId?: ObjectId` field to link appointments to beds
- All appointment queries now include bed information via MongoDB lookup

### 3. New Bed Management Service
**File**: `src/services/beds.services.ts`

**Key Methods**:
- `createBed()`: Create a new bed
- `getBeds()`: Get all beds
- `getAvailableBeds(date, startTime, endTime)`: Get beds available for a specific time slot
- `checkBedAvailability(bedId, date, startTime, endTime)`: Check if a specific bed is available
- `getBedAppointments(bedId)`: Get all appointments for a specific bed
- `updateBed()`: Update bed information
- `deleteBed()`: Delete a bed (only if no active appointments)

### 4. New Bed Controller
**File**: `src/controllers/beds.controller.ts`

Handles HTTP requests for all bed operations with proper error handling.

### 5. New Bed Routes
**File**: `src/routes/beds.routes.ts`

**Endpoints**:
- `POST /beds` - Create a new bed
- `GET /beds` - Get all beds
- `GET /beds/available?appointmentDate=YYYY-MM-DD&appointmentStartTime=HH:MM&appointmentEndTime=HH:MM` - Get available beds
- `GET /beds/check-availability?bedId=xxx&appointmentDate=YYYY-MM-DD&appointmentStartTime=HH:MM&appointmentEndTime=HH:MM` - Check specific bed availability
- `GET /beds/:bed_id` - Get a specific bed
- `PUT /beds/:bed_id` - Update a bed
- `DELETE /beds/:bed_id` - Delete a bed
- `GET /beds/:bed_id/appointments` - Get all appointments for a bed

### 6. Updated Appointment Service
**File**: `src/services/appointments.services.ts`
- Added `checkBedConflict()` method to prevent double bookings
- Updated `createAppointment()` to handle `bedId`
- All appointment aggregation queries now include bed lookup

### 7. Updated Appointment Controller
**File**: `src/controllers/appointments.controller.ts`
- Added bed conflict checking when creating appointments
- Returns error if bed is already booked for the requested time

### 8. Updated Database Service
**File**: `src/services/database.services.ts`
- Added `beds` collection getter

### 9. Updated Main Application
**File**: `src/index.ts`
- Registered `/beds` routes

## Environment Variables
Add this to your `.env` file:
```
DB_BEDS_COLLECTION=beds
```

## Database Setup

### Step 1: Initialize 10 Hospital Beds
Run this script to create your 10 beds in MongoDB:

```javascript
// Run this in MongoDB shell or use a seeding script
db.beds.insertMany([
  { bedNumber: 1, bedName: "Bed 1", isAvailable: true, department: "General", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 2, bedName: "Bed 2", isAvailable: true, department: "General", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 3, bedName: "Bed 3", isAvailable: true, department: "ICU", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 4, bedName: "Bed 4", isAvailable: true, department: "ICU", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 5, bedName: "Bed 5", isAvailable: true, department: "Emergency", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 6, bedName: "Bed 6", isAvailable: true, department: "Emergency", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 7, bedName: "Bed 7", isAvailable: true, department: "Surgery", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 8, bedName: "Bed 8", isAvailable: true, department: "Surgery", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 9, bedName: "Bed 9", isAvailable: true, department: "Pediatrics", createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 10, bedName: "Bed 10", isAvailable: true, department: "Pediatrics", createdAt: new Date(), updatedAt: new Date() }
])
```

Or use the API:
```bash
# Create beds via API (repeat for each bed)
curl -X POST http://localhost:3000/beds \
  -H "Content-Type: application/json" \
  -d '{
    "bedNumber": 1,
    "bedName": "Bed 1",
    "department": "General",
    "description": "General ward bed"
  }'
```

## API Usage Examples

### 1. Create an Appointment with a Bed
```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient_id_here",
    "doctorId": "doctor_id_here",
    "serviceId": "service_id_here",
    "bedId": "bed_id_here",
    "appointmentDate": "2025-10-15",
    "appointmentStartTime": "09:00",
    "appointmentEndTime": "10:00",
    "isEmergency": false,
    "note": "Regular checkup with bed assignment"
  }'
```

### 2. Get Available Beds for a Time Slot
```bash
curl "http://localhost:3000/beds/available?appointmentDate=2025-10-15&appointmentStartTime=09:00&appointmentEndTime=10:00"
```

### 3. Check Specific Bed Availability
```bash
curl "http://localhost:3000/beds/check-availability?bedId=bed_id_here&appointmentDate=2025-10-15&appointmentStartTime=09:00&appointmentEndTime=10:00"
```

### 4. Get All Beds
```bash
curl http://localhost:3000/beds
```

### 5. Get Bed Appointments
```bash
curl http://localhost:3000/beds/:bed_id/appointments
```

### 6. Update Bed Status
```bash
curl -X PUT http://localhost:3000/beds/:bed_id \
  -H "Content-Type: application/json" \
  -d '{
    "isAvailable": false,
    "description": "Under maintenance"
  }'
```

## Workflow for Booking with Beds

1. **Customer browses available beds**:
   ```
   GET /beds/available?appointmentDate=2025-10-15&appointmentStartTime=09:00&appointmentEndTime=10:00
   ```

2. **Customer selects a bed and creates appointment**:
   ```
   POST /appointments
   Body: { patientId, doctorId, serviceId, bedId, appointmentDate, appointmentStartTime, appointmentEndTime }
   ```

3. **System checks**:
   - Patient exists
   - Doctor availability (if doctorId provided)
   - Bed availability (if bedId provided)
   - Returns 409 Conflict if any conflict exists

4. **System creates appointment** if all checks pass

5. **View appointments with bed information**:
   ```
   GET /appointments/:appointment_id
   ```
   Response includes bed details in `bed` array

## Conflict Prevention

The system automatically prevents:
- Double booking of beds (same bed, same time slot)
- Double booking of doctors (same doctor, same time slot)
- Allows flexible appointment creation (bed is optional)

## Key Features

✅ Create, read, update, delete beds
✅ Check bed availability in real-time
✅ Get list of available beds for specific time slots
✅ Prevent double booking with automatic conflict detection
✅ View all appointments for a specific bed
✅ Optional bed assignment (appointments can be created without beds)
✅ Bed status management (available/unavailable)
✅ Department-based bed organization

## Testing Checklist

- [ ] Create 10 beds via API or database
- [ ] Get all beds
- [ ] Check bed availability for a time slot
- [ ] Create appointment with bed
- [ ] Try creating conflicting appointment (should fail)
- [ ] View appointments by bed
- [ ] Update bed information
- [ ] Mark bed as unavailable
- [ ] Delete bed (should fail if has active appointments)

## Notes

- Beds are optional in appointments - existing appointment creation still works without `bedId`
- All appointment queries now return bed information when available
- Time conflict checking uses 24-hour format (HH:MM)
- Cancelled appointments are excluded from conflict checking
- A bed can only be deleted if it has no active (pending/confirmed) appointments
