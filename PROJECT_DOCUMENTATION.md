# 🏠 StayEase - PG Room Booking System
## Complete Project Documentation

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Core Concepts & Technologies](#core-concepts--technologies)
4. [Data Flow Architecture](#data-flow-architecture)
5. [How the Application Works](#how-the-application-works)
6. [Page-by-Page Guide](#page-by-page-guide)
7. [Code Explanation](#code-explanation)
8. [Database Structure](#database-structure)
9. [User Workflows](#user-workflows)

---

## Project Overview

### What is StayEase?

StayEase is a **PG (Paying Guest) Room Booking System** - a web application that helps people find and book affordable rooms in Punjab. Think of it like Airbnb or OYO Rooms, but specifically designed for short-term and long-term room rentals.

### Main Purpose

- **Students, Professionals, and Travelers** can browse and book rooms
- **Admin Users** can manage rooms and bookings
- **Simple and Clean Interface** for easy navigation

### Key Features

✅ Browse available rooms  
✅ Filter rooms by type and price  
✅ View detailed room information  
✅ Book a room with personal details  
✅ Get booking confirmation  
✅ View booking history  
✅ Admin dashboard to manage rooms & bookings  

---

## Project Structure

```
stayease/
├── app.js                    # Main application file
├── package.json              # Project dependencies
├── data/
│   └── data.json            # Database (stores rooms & bookings)
├── models/
│   ├── Room.js              # Room management logic
│   └── Booking.js           # Booking management logic
├── routes/
│   ├── index.js             # User-facing routes
│   └── admin.js             # Admin routes
├── views/                   # HTML templates (EJS)
│   ├── index.ejs            # Home page
│   ├── rooms.ejs            # Browse rooms page
│   ├── roomDetail.ejs       # Single room details
│   ├── bookingForm.ejs      # Booking form
│   ├── confirmation.ejs     # Booking confirmation
│   ├── bookings.ejs         # User's bookings
│   ├── admin/               # Admin pages
│   │   ├── dashboard.ejs    # Admin dashboard
│   │   ├── rooms.ejs        # Manage rooms
│   │   ├── addRoom.ejs      # Add/Edit room
│   │   └── bookings.ejs     # Manage bookings
│   └── partials/            # Reusable components
│       ├── header.ejs       # Header template
│       ├── sidebar.ejs      # Navigation sidebar
│       └── footer.ejs       # Footer template
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/
│   │   └── main.js          # Frontend JavaScript
│   └── images/              # Image files
└── .env                      # Environment variables
```

---

## Core Concepts & Technologies

### 1. **Node.js & Express**

**What is Node.js?**
- A JavaScript runtime that allows you to run JavaScript outside the browser (on servers)
- Perfect for building web servers and web applications

**What is Express?**
- A framework that makes building web servers easier
- Handles URL routing, requests, and responses
- Think of it as a traffic controller for your web app

**In This Project:**
```javascript
const express = require('express');
const app = express();
```
- We create an Express app that listens on port 3001
- Routes handle requests like `/rooms`, `/admin`, `/book/:id`

### 2. **EJS (Embedded JavaScript Templating)**

**What is EJS?**
- A template engine that allows you to use JavaScript inside HTML
- Dynamically generate HTML pages with data from the server

**Example:**
```ejs
<h1><%= room.name %></h1>        <!-- Displays room name -->
<% for (let i = 0; i < 3; i++) { %>
  <p><%= i %></p>               <!-- Runs JavaScript code -->
<% } %>
```

**Why We Use It:**
- Server sends data → EJS converts it to HTML → Browser displays it
- Makes pages dynamic without reloading

### 3. **JSON Database**

**What is JSON?**
- JavaScript Object Notation - a simple format to store data
- Easy to read and write

**Data Structure:**
```json
{
  "rooms": [
    { "_id": "room001", "name": "Cozy Single Room", ... },
    { "_id": "room002", "name": "Shared Double Room", ... }
  ],
  "bookings": [
    { "_id": "book123", "guestName": "John", ... }
  ]
}
```

**Why JSON?**
- Simple, no complex database needed
- File-based storage in `data/data.json`
- Perfect for learning projects

### 4. **Bootstrap 5**

**What is Bootstrap?**
- A CSS framework that provides pre-built styles and components
- Makes the website responsive (looks good on phones, tablets, desktops)

**Used For:**
- Professional layout and buttons
- Grid system for organizing content
- Icons from Bootstrap Icons library

### 5. **ES6+ Modern JavaScript**

**Key Features Used:**
- **Arrow Functions:** `const getRooms = () => { }`
- **Template Literals:** `` const url = `/room/${id}`; ``
- **Destructuring:** `const { name, email } = req.body;`
- **Array Methods:** `.filter()`, `.map()`, `.find()`, `.reduce()`
- **Const/Let:** Better variable management than `var`

---

## Data Flow Architecture

### How Information Flows Through the Application

```
1. USER MAKES REQUEST
   ↓
2. EXPRESS RECEIVES REQUEST
   ↓
3. ROUTE HANDLER PROCESSES IT
   ↓
4. MODEL ACCESSES DATA (JSON FILE)
   ↓
5. DATA RETURNED TO ROUTE HANDLER
   ↓
6. ROUTE HANDLER PASSES DATA TO VIEW
   ↓
7. EJS TEMPLATE RENDERS HTML WITH DATA
   ↓
8. HTML SENT TO BROWSER
   ↓
9. USER SEES THE PAGE
```

### Example: When User Visits `/rooms`

1. **Browser sends request:** `GET /rooms`
2. **Router receives it at `routes/index.js`:**
   ```javascript
   router.get('/rooms', (req, res) => { ... })
   ```
3. **Route handler extracts filters:** `type`, `maxPrice`, `search` from URL
4. **Calls Room model:** `Room.getAvailableRooms()`
5. **Model reads `data.json` file:**
   ```javascript
   const data = loadRooms();  // Reads from disk
   return data.rooms.filter(...);  // Filters data
   ```
6. **Returns filtered rooms to route handler**
7. **Route passes data to EJS template:**
   ```javascript
   res.render('rooms', { rooms: filteredRooms });
   ```
8. **EJS template converts to HTML and sends to browser**

---

## How the Application Works

### Starting the Application

**Command to run:**
```bash
npm start          # Runs: node app.js
npm run dev        # Runs: nodemon app.js (auto-restart on changes)
```

**What happens in `app.js`:**

```javascript
const express = require('express');
const app = express();
const PORT = 3001;

// Middleware setup
app.use(express.urlencoded({ extended: true }));  // Parse form data
app.use(express.json());                           // Parse JSON data
app.use(express.static(path.join(__dirname, 'public')));  // Serve images/CSS

// View engine setup
app.set('view engine', 'ejs');   // Tell Express to use EJS
app.set('views', path.join(__dirname, 'views'));  // Where templates are

// Load routes
app.use('/', indexRoutes);       // User routes at /
app.use('/admin', adminRoutes);  // Admin routes at /admin

// Error handling
app.use(function(req, res) {
  res.status(404).render('404');  // Show 404 page if route not found
});

// Start server
app.listen(PORT, function() {
  console.log('StayEase PG running at http://localhost:' + PORT);
});
```

**What Each Part Does:**

- **Middleware:** Code that runs before route handlers
  - `urlencoded`: Converts form data into JavaScript objects
  - `json`: Handles JSON data from API calls
  - `static`: Serves files like CSS, images without processing

- **View Engine:** Tells Express to use EJS for rendering
  
- **Routes:** Define what happens at different URLs

- **Error Handling:** If no route matches, show 404 page

- **Listeners:** Start server on port 3001

---

## Page-by-Page Guide

### 🏠 **1. Home Page (`/`)**

**File:** `views/index.ejs`

**What User Sees:**
- Welcome message with luxury design
- Featured rooms (first 3 available rooms)
- Search bar to filter by room type and max price
- Statistics (50+ rooms, 1000+ residents, 4.8⭐ rating)
- Trust indicators and features

**How It Works:**

```javascript
// routes/index.js
router.get('/', (req, res) => {
  const rooms = Room.getAvailableRooms();           // Get all available rooms
  const featuredRooms = rooms.slice(0, 3);         // Take first 3
  res.render('index', { 
    title: 'StayEase - Find Your Perfect Stay', 
    rooms: featuredRooms 
  });
});
```

**Data Passed to Template:**
- `title`: Page title
- `rooms`: Array of 3 featured rooms

**Rendering in EJS:**
```ejs
<% rooms.forEach(room => { %>
  <div class="room-card">
    <img src="<%= room.image %>" />
    <h5><%= room.name %></h5>
    <p>₹<%= room.monthlyPrice %>/month</p>
  </div>
<% }) %>
```

---

### 🔍 **2. Browse Rooms Page (`/rooms`)**

**File:** `views/rooms.ejs`

**What User Sees:**
- Filter form (room type, max price, search)
- Grid of available rooms with images
- Room cards showing name, price, amenities, rating
- "View" button to see details

**Query Parameters Sent:**
```
/rooms?type=Single&maxPrice=15000&search=cozy
```

**How Filtering Works:**

```javascript
// routes/index.js
router.get('/rooms', (req, res) => {
  // Extract filter parameters
  const { type = '', search: searchQuery = '' } = req.query;
  const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : NaN;
  const search = searchQuery.toLowerCase().trim();
  
  // Get all available rooms
  const rooms = Room.getAvailableRooms();
  
  // Apply all filters
  const filteredRooms = rooms.filter(room => {
    const typeMatch = !type || room.type === type;           // Match type
    const priceMatch = isNaN(maxPrice) || room.monthlyPrice <= maxPrice;  // Match price
    const searchMatch = !search || 
      room.name.toLowerCase().includes(search) ||            // Match in name
      room.description.toLowerCase().includes(search);       // Match in description
    return typeMatch && priceMatch && searchMatch;           // ALL must match
  });
  
  res.render('rooms', { rooms: filteredRooms, query: req.query });
});
```

**How Each Filter Works:**

| Filter | Logic |
|--------|-------|
| **Room Type** | If user selected "Single", only show Single rooms |
| **Max Price** | Only show rooms with price ≤ selected price |
| **Search Text** | Find rooms with text in name or description |

**Important:** All 3 filters must be true for a room to show (AND logic)

---

### 🏘️ **3. Room Detail Page (`/rooms/:id`)**

**File:** `views/roomDetail.ejs`

**What User Sees:**
- Large room image
- Room name, type, and price
- Detailed description
- Amenities list
- Utilities information (electricity, water)
- Rating
- "Book Now" button

**How It Works:**

```javascript
router.get('/rooms/:id', (req, res) => {
  const room = Room.getRoomById(req.params.id);  // Get room by ID from URL
  if (!room) {
    return res.redirect('/rooms');  // If room not found, go back
  }
  res.render('roomDetail', { title: room.name, room });
});
```

**`:id` Explained:**
- Dynamic parameter in URL
- `req.params.id` gets the actual ID
- Example: `/rooms/room001` → `id = room001`

---

### 📋 **4. Booking Form Page (`/book/:id`)**

**File:** `views/bookingForm.ejs`

**What User Sees:**
- Room information
- Form to collect booking details:
  - Guest Name
  - Email
  - Phone
  - Check-in Date
  - Check-out Date
  - Number of Guests
  - Duration in Months
- Dynamic price calculator (updates as user changes duration)

**Price Calculator JavaScript:**

```javascript
// When user changes months, price updates automatically
const pricePerMonth = <%= room.monthlyPrice %>;
function updatePrice() {
  const months = parseInt(monthsInput.value) || 1;
  const total = pricePerMonth * months;
  document.getElementById('totalAmount').textContent = total;
  pricePreview.style.display = 'block';
}
monthsInput.addEventListener('change', updatePrice);
monthsInput.addEventListener('input', updatePrice);
```

**Why This is Important:**
- Shows real-time price to user
- No page reload needed
- Improves user experience

---

### ✅ **5. Booking Confirmation (`POST /book/:id`)**

**What Happens:**

```javascript
// routes/index.js
router.post('/book/:id', (req, res) => {
  // Extract user input from form
  const { guestName, email, phone, checkIn, checkOut, guests, months = 1 } = req.body;
  
  // Create booking in database
  const booking = Booking.createBooking(
    guestName, email, phone, 
    req.params.id,      // Room ID
    checkIn, checkOut, guests, months
  );
  
  if (!booking) {
    return res.redirect('/rooms');  // If room not found
  }
  
  // Redirect to confirmation page
  res.redirect(`/confirmation/${booking._id}`);
});
```

**Step-by-Step:**

1. Form submitted with POST method
2. Express receives data in `req.body`
3. Destructuring extracts field values
4. Booking model creates new booking record
5. Record saved to `data.json`
6. Booking ID returned
7. User redirected to confirmation page

---

### 🎉 **6. Booking Confirmation Page (`/confirmation/:id`)**

**File:** `views/confirmation.ejs`

**What User Sees:**
- Booking confirmation message
- Booking details (dates, guest info)
- Room information
- Total price
- Utilities information
- Reference ID for future booking

**How It Works:**

```javascript
router.get('/confirmation/:id', (req, res) => {
  // Get booking by ID
  const booking = Booking.getBookingById(req.params.id);
  if (!booking) {
    return res.redirect('/rooms');
  }
  
  // Get the room details for this booking
  const room = Room.getRoomById(booking.room);
  
  // Combine booking and room data
  const bookingWithRoom = {
    ...booking,  // All booking fields
    room         // Add room object
  };
  
  res.render('confirmation', { booking: bookingWithRoom });
});
```

---

### 📚 **7. My Bookings Page (`/bookings`)**

**File:** `views/bookings.ejs`

**What User Sees:**
- List of all their bookings
- Booking status (Pending/Confirmed/Cancelled)
- Room details for each booking
- Dates and total amount paid
- Statistics about total spent

**How It Works:**

```javascript
router.get('/bookings', (req, res) => {
  // Get all bookings
  const bookings = Booking.getAllBookings();
  
  // For each booking, get the room details
  const bookingsWithRooms = bookings.map(booking => ({
    ...booking,                           // All booking fields
    room: Room.getRoomById(booking.room)  // Add room details
  }));
  
  res.render('bookings', { bookings: bookingsWithRooms });
});
```

**Why Map Booking to Rooms?**
- User needs to see which room they booked
- Must join booking data with room data
- `.map()` transforms each booking to include room info

---

## Admin Pages

### 👨‍💼 **Admin Dashboard (`/admin`)**

**What Admin Sees:**
- Total number of rooms available
- Total bookings made
- Revenue from confirmed bookings
- List of 5 most recent bookings

**How It Works:**

```javascript
router.get('/', (req, res) => {
  const rooms = Room.getAllRooms();
  const bookings = Booking.getAllBookings();
  const recentBookings = Booking.getRecentBookings(5);
  const revenue = Booking.calculateRevenue();

  res.render('admin/dashboard', {
    totalRooms: rooms.length,
    totalBookings: bookings.length,
    revenue,                    // Revenue from confirmed bookings only
    recentBookings
  });
});
```

### 📝 **Manage Rooms (`/admin/rooms`)**

**What Admin Can Do:**
- View all rooms
- Edit room details
- Delete rooms
- Add new rooms

**Edit/Delete Forms:**

```ejs
<!-- Edit button -->
<a href="/admin/rooms/<%= room._id %>/edit">Edit</a>

<!-- Delete form -->
<form action="/admin/rooms/<%= room._id %>/delete" method="POST">
  <button type="submit" onclick="return confirm('Sure?')">Delete</button>
</form>
```

### ➕ **Add/Edit Room (`/admin/rooms/new` or `/admin/rooms/:id/edit`)**

**Form Fields:**
- PG Name
- Room Type (Single, Double, Suite, Deluxe)
- Monthly Price
- Utilities billing (Electricity, Water included/separate)
- Description
- Image URL
- Amenities (checkboxes)
- Rating
- Availability (toggle)

**How Add Works:**

```javascript
router.post('/rooms', (req, res) => {
  const {
    name, type, monthlyPrice, description,
    image = 'default_image.jpg',  // Default if not provided
    rating = 4.0
  } = req.body;
  
  Room.addRoom(name, type, monthlyPrice, description, image, ..., rating);
  res.redirect('/admin/rooms');  // Go back to room list
});
```

**How Update Works:**

```javascript
router.post('/rooms/:id/update', (req, res) => {
  // Same form data extraction
  // But update existing room instead of creating new
  Room.updateRoom(req.params.id, name, type, ...);
  res.redirect('/admin/rooms');
});
```

### 📅 **Admin Bookings (`/admin/bookings`)**

**What Admin Can Do:**
- View all bookings
- Change booking status (Pending → Confirmed → Cancelled)
- See booking details and room information

**Status Update:**

```javascript
router.post('/bookings/:id/update', (req, res) => {
  const { status } = req.body;  // New status from dropdown
  Booking.updateBookingStatus(req.params.id, status);
  res.redirect('/admin/bookings');
});
```

---

## Code Explanation

### 📁 **models/Room.js**

**Purpose:** Handle all room-related operations

```javascript
const getRoomById = (id) => {
  const data = loadRooms();                    // Read from JSON file
  return data.rooms.find(room => room._id === id) || null;
};
```

**What It Does:**
1. Loads the JSON file
2. Searches for room with matching ID
3. Returns room or null if not found

**Why `.find()`?**
- Old way: Loop through array checking each item
- New way: `.find()` does it in one line
- More readable and efficient

```javascript
const addRoom = (name, type, monthlyPrice, ...) => {
  const data = loadRooms();
  
  const newRoom = {
    _id: `room${Date.now()}`,        // Unique ID using current time
    name,                             // ES6 shorthand (name: name)
    type,
    monthlyPrice: parseInt(monthlyPrice),  // Convert to number
    isAvailable: true,                // New rooms are always available
    // ... other fields
  };
  
  data.rooms.push(newRoom);           // Add to array
  saveRooms(data);                    // Save back to file
  return newRoom;
};
```

**Key Concepts:**

| Concept | Explanation |
|---------|-------------|
| **Date.now()** | Returns current time in milliseconds (unique) |
| **parseInt()** | Converts string to number |
| **push()** | Adds item to end of array |
| **ES6 Shorthand** | `{ name }` instead of `{ name: name }` |

### 📅 **models/Booking.js**

**Purpose:** Handle all booking-related operations

```javascript
const createBooking = (guestName, email, phone, roomId, checkIn, checkOut, guests, months) => {
  const data = loadData();
  
  // Find the room being booked
  const room = data.rooms.find(r => r._id === roomId);
  if (!room) return null;  // Room doesn't exist
  
  // Calculate total price
  const monthCount = parseInt(months) || 1;  // Default to 1 month
  const totalPrice = monthCount * room.monthlyPrice;
  
  // Create booking record
  const newBooking = {
    _id: `book${Date.now()}`,
    guestName,
    email,
    phone,
    room: roomId,              // Store just the room ID (reference)
    checkIn,
    checkOut,
    guests: parseInt(guests),
    months: monthCount,
    monthlyRate: room.monthlyPrice,
    totalPrice,                // Final cost
    utilities: room.utilities, // Copy utilities from room
    status: 'Pending',         // Initial status
    createdAt: new Date().toISOString()  // When booking was made
  };
  
  data.bookings.push(newBooking);
  saveData(data);
  return newBooking;
};
```

**Why Store Only Room ID?**
- Don't duplicate room data in booking
- If room is updated, booking doesn't have stale data
- When showing bookings, we join with room data from models

```javascript
const getRecentBookings = (limit = 5) => {
  const data = loadData();
  return [...data.bookings]                    // Create copy (spread operator)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))  // Sort newest first
    .slice(0, limit);                          // Take first N items
};
```

**Why Spread Operator `[...]`?**
- `.sort()` modifies original array
- We make a copy first to avoid changing actual data
- Returns sorted copy without affecting database

```javascript
const calculateRevenue = () => {
  const data = loadData();
  return data.bookings
    .filter(booking => booking.status === 'Confirmed')  // Only confirmed
    .reduce((total, booking) => total + booking.totalPrice, 0);  // Sum all
};
```

**Understanding `.reduce()`:**
- Takes array and reduces it to single value
- `(total, booking)` - accumulator and current item
- `total + booking.totalPrice` - add current booking to total
- `0` - start total at 0

**Example:**
```
bookings = [{totalPrice: 1000}, {totalPrice: 2000}]
.reduce((total, booking) => total + booking.totalPrice, 0)

Step 1: total = 0, booking = {1000} → 0 + 1000 = 1000
Step 2: total = 1000, booking = {2000} → 1000 + 2000 = 3000
Result: 3000
```

---

## Database Structure

### 📊 **data.json Layout**

```json
{
  "rooms": [
    {
      "_id": "room001",                    // Unique identifier
      "name": "Cozy Single Room",
      "type": "Single",                     // Room type
      "monthlyPrice": 10000,                // Price per month in rupees
      "description": "Affordable single room...",
      "amenities": ["WiFi", "AC", "TV"],    // Array of amenities
      "utilities": {
        "electricity": "separate",          // Billed separately or included
        "water": "included",                // Included in rent
        "description": "Water included..."
      },
      "isAvailable": true,                  // Can be booked?
      "image": "https://...",               // Room photo URL
      "rating": 4.2                         // User rating (0-5)
    }
  ],
  "bookings": [
    {
      "_id": "book1234567890",              // Unique booking ID
      "guestName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "room": "room001",                    // Which room (reference)
      "checkIn": "2024-04-15",              // Move-in date
      "checkOut": "2024-06-15",             // Move-out date
      "guests": 1,                          // Number of people
      "months": 2,                          // Duration
      "monthlyRate": 10000,                 // Price when booked
      "totalPrice": 20000,                  // months * monthlyRate
      "utilities": {
        "electricity": "separate",          // Copy of room utilities
        "water": "included",
        "description": "..."
      },
      "status": "Pending",                  // Pending/Confirmed/Cancelled
      "createdAt": "2024-04-07T10:30:00.000Z"  // When booked
    }
  ]
}
```

### 🔗 **Data Relationships**

```
Bookings → Rooms (One booking references one room)

When you see a booking:
1. Get booking from data.bookings
2. Check booking.room (this is a room ID)
3. Find that room in data.rooms
4. Display both booking and room info together
```

---

## User Workflows

### 👤 **Workflow 1: Customer Browsing & Booking**

```
1. Customer visits http://localhost:3001
   ↓
2. Home page loads with featured rooms
   ↓
3. Clicks "Browse All Rooms" → Goes to /rooms
   ↓
4. Optionally filters by type/price
   Browser sends: /rooms?type=Single&maxPrice=15000
   ↓
5. Filtered rooms display
   ↓
6. Clicks "View" on a room → Goes to /rooms/room001
   ↓
7. Can see full details
   ↓
8. Clicks "Book Now" → Goes to /book/room001
   ↓
9. Fills booking form with details
   ↓
10. Submits form → POST to /book/room001
    Express creates booking record
    ↓
11. Redirects to /confirmation/book1234567890
    ↓
12. Sees confirmation with booking ID
    ↓
13. Clicks "My Bookings" → Goes to /bookings
    ↓
14. Sees all their bookings with status
```

### 🔧 **Workflow 2: Admin Managing Rooms**

```
1. Admin visits http://localhost:3001/admin
   ↓
2. Sees dashboard with stats
   ↓
3. Clicks "Manage Rooms"
   ↓
4. Sees list of all rooms
   ↓
5. Option to:
   
   a) EDIT ROOM:
      - Click "Edit" → /admin/rooms/room001/edit
      - Form pre-filled with current data
      - Update fields
      - Click "Update" → POST to /admin/rooms/room001/update
      - Returns to room list
   
   b) DELETE ROOM:
      - Click "Delete" → Shows confirmation dialog
      - Submits → POST to /admin/rooms/room001/delete
      - Room removed from data.json
      - Page refreshed
   
   c) ADD ROOM:
      - Click "Add New" → /admin/rooms/new
      - Form is empty
      - Fill all details
      - Click "Add" → POST to /admin/rooms
      - New room saved to data.json
      - Returns to room list
```

### 💼 **Workflow 3: Admin Managing Bookings**

```
1. Admin visits /admin
   ↓
2. Clicks "Manage Bookings" → /admin/bookings
   ↓
3. Sees list of bookings with room details
   ↓
4. For each booking, can change status:
   - Dropdown shows: Pending, Confirmed, Cancelled
   - User selects new status
   - Form auto-submits (onchange event)
   - Status updated in data.json
   - Revenue recalculated (if Confirmed)
```

---

## Key Behind-the-Scenes Concepts

### 🔄 **Request-Response Cycle**

```
         BROWSER
        ↓      ↑
    [Request] [Response - HTML]
        ↓      
      EXPRESS SERVER
        ↓
    ROUTE HANDLER
        ↓
    MODEL (Read data)
        ↓
    USE EJS TO RENDER
        ↓
    SEND BACK TO BROWSER
```

### 📄 **What Happens When User Submits a Form**

```html
<form action="/book/room001" method="POST">
  <input name="guestName" value="John" />
  <input name="email" value="john@example.com" />
  <button>Submit</button>
</form>
```

**When submitted:**

1. Browser collects form data:
   ```
   {
     guestName: "John",
     email: "john@example.com",
     ...
   }
   ```

2. Sends POST request to `/book/room001`

3. Express receives in `req.body`:
   ```javascript
   req.body = {
     guestName: "John",
     email: "john@example.com",
     ...
   }
   ```

4. Route handler extracts with destructuring:
   ```javascript
   const { guestName, email } = req.body;
   ```

5. Creates booking and saves to data.json

6. Redirects user to confirmation page

### 🎨 **How Pages Render**

```
EJS Template File (With placeholders)
          ⟳
        Merge with data from server
          ⟳
        Converted to plain HTML
          ⟳
        Sent to browser
          ⟳
        Browser displays HTML
```

**Example:**

Template:
```ejs
<h1><%= room.name %></h1>
<p>Price: ₹<%= room.monthlyPrice %></p>
```

With data:
```javascript
{ name: "Cozy Room", monthlyPrice: 10000 }
```

Becomes HTML:
```html
<h1>Cozy Room</h1>
<p>Price: ₹10000</p>
```

### 💾 **Data Persistence**

```
Initial data.json
      ↓
Loaded into memory (JavaScript object)
      ↓
Modified (add/update/delete)
      ↓
Written back to data.json
      ↓
When server restarts, data still there!
```

**Why This Works:**
- JSON file is permanent storage on disk
- Every change writes back to file
- Data survives server restarts

**Limitation:**
- If multiple requests happen simultaneously, might lose data
- Real apps use databases (MongoDB, MySQL) that are thread-safe
- This is fine for learning projects

---

## Important Functions Explained

### 🔍 **Array Methods Used**

| Method | What It Does | Example |
|--------|-------------|---------|
| `.filter()` | Keep items that match condition | `rooms.filter(r => r.isAvailable)` - get only available rooms |
| `.find()` | Get first item that matches | `bookings.find(b => b._id === id)` - get one booking |
| `.map()` | Transform each item | `bookings.map(b => (b.room = getRoom(b.room), b))` - add room data |
| `.slice()` | Get portion of array | `rooms.slice(0, 3)` - get first 3 rooms |
| `.sort()` | Reorder array | `bookings.sort((a,b) => b.date - a.date)` - newest first |
| `.reduce()` | Combine into single value | `bookings.reduce((total, b) => total + b.price, 0)` - sum all |
| `.push()` | Add to end | `rooms.push(newRoom)` - add new room |

### 🔐 **Middleware Explained**

```javascript
app.use(express.urlencoded({ extended: true }));
```

**What It Does:**
- Intercepts incoming requests
- If form data detected, converts it to JavaScript object
- Stores in `req.body` for route to use

**Example:**
```
Form data from browser:
  "guestName=John&email=john@email.com"
          ↓ (middleware processes)
becomes:
  req.body = {
    guestName: "John",
    email: "john@email.com"
  }
```

### 🎯 **Route Parameters vs Query Strings**

```
ROUTE PARAMETERS (in URL path):
/rooms/:id
Actual URL: /rooms/room001
Access as: req.params.id

QUERY STRING (after ?):
/rooms?type=Single&maxPrice=15000
Access as: req.query.type, req.query.maxPrice
```

**When to Use Each:**

| Use | For |
|-----|-----|
| Route Parameters | Identifying a specific resource (/rooms/123) |
| Query String | Filtering/searching (?search=xyz&type=abc) |

---

## Development vs Production

### 🛠️ **During Development**

```bash
npm run dev    # Runs with nodemon
```

**What Happens:**
- Server starts
- Watches for file changes
- Auto-restarts when you save files
- Perfect for testing

### 🚀 **In Production**

```bash
npm start      # Just runs node app.js
```

**What Happens:**
- Server starts once
- Stays running
- Deployed to hosting service
- Handles real users

---

## Troubleshooting Guide

### ❌ Problem: Room doesn't show up after adding

**Usual Causes:**
1. `isAvailable` is false - Set to true in form
2. Room type filter active - Clear filters
3. Price too high - Check price filter

**Debug:**
1. Check `data.json` - is room there?
2. Check browser console - any errors?
3. Check server terminal - any error messages?

### ❌ Problem: Booking shows but room details missing

**Cause:** Room was deleted but booking remains

**Solution:** The booking references a room that no longer exists

```javascript
// In templates, check if room exists:
<% if (booking.room) { %>
  <%= booking.room.name %>
<% } else { %>
  Room was deleted
<% } %>
```

### ❌ Problem: Data lost after server restart

**Note:** This is expected! JSON file is only storage.
- If data.json is deleted, all data is gone
- Always backup data.json before testing delete functions
- In real apps, use database for persistent storage

---

## Next Steps for Learning

### 📚 **Concepts to Explore**

1. **Database (MongoDB)** - Replace data.json with real database
2. **Authentication** - Add login system for users and admins
3. **Search Improvements** - Add more filters (amenities, rating)
4. **Email Notifications** - Send confirmation emails
5. **Payment Integration** - Add actual payment processing
6. **Reviews/Ratings** - Let customers rate rooms
7. **Image Upload** - Let admins upload room photos instead of URLs

### 🔒 **Security Improvements**

1. **Input Validation** - Check all form inputs are safe
2. **SQL Injection** - When using databases
3. **CSRF Protection** - Prevent cross-site attacks
4. **Session Management** - Store user login securely
5. **Password Hashing** - Never store passwords as plain text

### ⚡ **Performance Improvements**

1. **Caching** - Store frequently accessed data in memory
2. **Database Indexing** - Speed up searches
3. **Pagination** - Load bookings/rooms 10 at a time instead of all
4. **API Rate Limiting** - Prevent abuse
5. **Lazy Loading** - Load images only when needed

---

## Summary

✅ **StayEase is a complete PG booking system with:**
- User-facing room browsing and booking
- Admin panel for room and booking management
- Search and filtering functionality
- Real-time price calculation
- Booking confirmation and history

✅ **Built with Modern Technologies:**
- Express.js for server
- EJS for templating
- JSON for data storage
- ES6+ JavaScript features
- Bootstrap for responsive design

✅ **Key Learning Points:**
- Request-response cycle
- Data modeling and relationships
- Array methods and transformations
- Route handling and middleware
- Template rendering with EJS
- CRUD operations (Create, Read, Update, Delete)

---

## Quick Reference

### 🌐 **URLs in Application**

| URL | Method | What It Does |
|-----|--------|-------------|
| `/` | GET | Home page |
| `/rooms` | GET | Browse rooms |
| `/rooms/:id` | GET | Room details |
| `/book/:id` | GET | Booking form |
| `/book/:id` | POST | Submit booking |
| `/confirmation/:id` | GET | Booking confirmation |
| `/bookings` | GET | My bookings |
| `/admin` | GET | Admin dashboard |
| `/admin/rooms` | GET | Manage rooms |
| `/admin/rooms/new` | GET | Add room form |
| `/admin/rooms/:id/edit` | GET | Edit room form |
| `/admin/rooms` | POST | Create room |
| `/admin/rooms/:id/update` | POST | Update room |
| `/admin/rooms/:id/delete` | POST | Delete room |
| `/admin/bookings` | GET | Manage bookings |
| `/admin/bookings/:id/update` | POST | Update booking status |

---

**Happy Learning! 🎓**

This comprehensive documentation explains every concept and feature of the StayEase project in simple, easy-to-understand language.
