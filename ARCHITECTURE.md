# Hospital Bed Booking System - Architecture

## System Flow

```
┌─────────────┐
│   Customer  │
└──────┬──────┘
       │
       │ 1. Check Available Beds
       ↓
┌─────────────────────────────────────┐
│  GET /beds/available                │
│  ?appointmentDate=2025-10-15        │
│  &appointmentStartTime=09:00        │
│  &appointmentEndTime=11:00          │
└──────┬──────────────────────────────┘
       │
       │ 2. Returns Available Beds
       ↓
┌────────────────────────────────┐
│  Response:                     │
│  [                             │
│    {                           │
│      "_id": "bed_1_id",        │
│      "bedNumber": 1,           │
│      "bedName": "Bed 1",       │
│      "department": "General",  │
│      "isAvailable": true       │
│    },                          │
│    ...                         │
│  ]                             │
└──────┬─────────────────────────┘
       │
       │ 3. Select Bed & Create Appointment
       ↓
┌────────────────────────────────┐
│  POST /appointments            │
│  {                             │
│    "patientId": "...",         │
│    "bedId": "bed_1_id", ←─────┼── Selected Bed
│    "appointmentDate": "...",   │
│    "appointmentStartTime":"..│
│    "appointmentEndTime": "..." │
│  }                             │
└──────┬─────────────────────────┘
       │
       │ 4. System Checks
       ↓
┌─────────────────────────────────────┐
│  Validation Checks:                 │
│  ✓ Patient exists?                  │
│  ✓ Doctor available? (if doctorId)  │
│  ✓ Bed available? (if bedId)        │
└──────┬──────────────────────────────┘
       │
       ├─── Conflict Found ────→ ❌ 409 Error
       │
       └─── All Clear ─────────→ ✅ Appointment Created
```

## Database Schema

```
┌──────────────────┐
│   Appointments   │
├──────────────────┤
│ _id              │
│ patientId  ──────┼──→ References patients
│ doctorId   ──────┼──→ References doctors
│ serviceId  ──────┼──→ References services
│ bedId      ──────┼──→ References beds (NEW!)
│ appointmentDate  │
│ startTime        │
│ endTime          │
│ status           │
│ ...              │
└──────────────────┘
         │
         │ MongoDB $lookup
         ↓
┌──────────────────┐
│      Beds        │
├──────────────────┤
│ _id              │
│ bedNumber        │
│ bedName          │
│ department       │
│ isAvailable      │
│ description      │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

## Conflict Detection Logic

```
Time Conflict Check:
════════════════════

Existing Appointment:  [─────────]
                       09:00   11:00

New Request 1:    [─────]              ❌ Conflict!
                  08:00 10:00

New Request 2:           [─────]       ❌ Conflict!
                         10:00 12:00

New Request 3:  [───────────────]      ❌ Conflict!
                08:00         12:00

New Request 4:  [──]                   ✅ No Conflict
                07:00 08:00

New Request 5:                [──]     ✅ No Conflict
                              12:00 13:00

Algorithm:
─────────
function hasConflict(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2
}
```

## API Request Flow

```
┌──────────────┐
│    Client    │
└──────┬───────┘
       │
       │ HTTP Request
       ↓
┌──────────────────┐
│   Express.js     │
│   Routes         │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   Controller     │
│   - Validation   │
│   - Error Handle │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   Service        │
│   - Business     │
│     Logic        │
│   - Conflict     │
│     Checking     │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   Database       │
│   (MongoDB)      │
└──────────────────┘
```

## Bed Availability Query

```javascript
// How the system finds available beds:

1. Get all beds where isAvailable = true
   ↓
2. Get all appointments for target date
   ↓
3. Filter out beds with conflicting appointments
   ↓
4. Return available beds

Example:
────────
Date: 2025-10-15
Time: 09:00 - 11:00

Beds Status:
┌──────┬──────────────────────────────┐
│ Bed  │ Status                       │
├──────┼──────────────────────────────┤
│ 1    │ ✅ Available                 │
│ 2    │ ❌ Booked (09:00-10:00)      │
│ 3    │ ✅ Available                 │
│ 4    │ ❌ Under Maintenance         │
│ 5    │ ✅ Available                 │
└──────┴──────────────────────────────┘

Returns: [Bed 1, Bed 3, Bed 5]
```

## Complete Workflow Example

```
Step 1: Initialize Beds
═══════════════════════
$ npm run seed:beds
✓ Created 10 beds


Step 2: Customer Books Bed
═══════════════════════════
Customer Action:
"I need a bed on Oct 15 from 9 AM to 11 AM"

System Query:
GET /beds/available?date=2025-10-15&start=09:00&end=11:00

Response:
[Bed 1, Bed 3, Bed 5, Bed 7, Bed 9] available


Step 3: Customer Selects Bed
════════════════════════════
Customer: "I'll take Bed 3"

POST /appointments
{
  "bedId": "bed_3_id",
  "appointmentDate": "2025-10-15",
  "appointmentStartTime": "09:00",
  "appointmentEndTime": "11:00"
}


Step 4: System Validates
════════════════════════
✓ Patient exists
✓ Doctor available
✓ Bed 3 available

→ Appointment created! 🎉


Step 5: Another Customer Tries Same Bed
═══════════════════════════════════════
POST /appointments
{
  "bedId": "bed_3_id",  ← Same bed
  "appointmentDate": "2025-10-15",
  "appointmentStartTime": "10:00",  ← Overlaps!
  "appointmentEndTime": "12:00"
}

Response: 409 Conflict
"Giường bệnh đã được đặt trong khoảng thời gian này"

→ Booking prevented! ✋
```

## Technology Stack

```
┌─────────────────────────────────────┐
│           Frontend (Your)           │
│         React / Vue / etc.          │
└────────────────┬────────────────────┘
                 │ HTTP/REST API
                 ↓
┌─────────────────────────────────────┐
│           Backend (Node.js)         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Express.js Framework      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     TypeScript                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Business Logic               │ │
│  │  - Beds Service               │ │
│  │  - Appointments Service       │ │
│  │  - Conflict Detection         │ │
│  └───────────────────────────────┘ │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│        MongoDB Database             │
│                                     │
│  Collections:                       │
│  - patients                         │
│  - doctors                          │
│  - services                         │
│  - appointments                     │
│  - beds (NEW!)                      │
└─────────────────────────────────────┘
```

## Key Design Decisions

1. **Optional Bed Assignment**

   - Appointments can work without beds
   - Backward compatible

2. **Real-time Availability**

   - Checks done at booking time
   - Prevents race conditions

3. **Flexible Time Slots**

   - Any duration supported
   - Minute-level precision

4. **Department Organization**

   - Beds grouped by department
   - Easy filtering and management

5. **Status Management**

   - Beds can be marked unavailable
   - Useful for maintenance

6. **Conflict Prevention**
   - Automatic checking
   - No manual coordination needed
