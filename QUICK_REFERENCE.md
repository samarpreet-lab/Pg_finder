# MongoDB & Aadhar Implementation - Quick Reference

## 🎯 What Was Added

### 1. **MongoDB Database**
- Replaced JSON file storage
- All data now stored in MongoDB
- Connection configured in `config/database.js`
- Set MongoDB URI in `.env` file

### 2. **Aadhar Card Support**
- Booking form now has:
  - Aadhar Number input (12 digits)
  - Aadhar Card file upload (PDF/JPG, max 5MB)
- Validation:
  - 12-digit format enforced
  - File type restricted to PDF, JPG, JPEG
  - File size limited to 5MB
- Aadhar info displayed on:
  - Confirmation page
  - Bookings list page
  - Admin panel

### 3. **File Upload System**
- Using Multer middleware
- Files stored in `public/uploads/aadhar/`
- Automatic cleanup on validation failure
- Secure filename generation

---

## 📂 New File Locations

```
stayease/
├── config/
│   └── database.js          ← MongoDB connection
├── middleware/
│   └── upload.js            ← File upload configuration
├── scripts/
│   └── migrate.js           ← Data migration script
├── public/uploads/aadhar/   ← Aadhar files storage
└── .env                     ← Environment config
```

---

## 🔧 Configuration

### .env File
```
MONGODB_URI=mongodb://localhost:27017/stayease
NODE_ENV=development
PORT=3001
```

For production MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stayease
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud connection in .env
```

### 3. Run Application
```bash
npm start
```

Application runs on: `http://localhost:3001`

### 4. (Optional) Migrate Existing Data
```bash
node scripts/migrate.js
```

---

## ✅ Key Features

| Feature | Details |
|---------|---------|
| **Aadhar Input** | 12-digit validation, client + server-side |
| **File Upload** | PDF/JPG support, 5MB limit, secure storage |
| **Confirmation** | Shows Aadhar number and download link |
| **Bookings List** | Displays Aadhar status with download option |
| **Admin Panel** | Can view and download Aadhar documents |
| **Database** | MongoDB with Mongoose schemas |

---

## 📝 Form Fields

### Booking Form Now Includes:
1. Full Name
2. Email Address
3. Phone Number
4. **Aadhar Number** (NEW)
5. **Aadhar Card Upload** (NEW)
6. Move-In Date
7. Move-Out Date
8. Number of Guests
9. Duration (Months)

---

## 🔗 New Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/book/:id` | Booking form with Aadhar fields |
| POST | `/book/:id` | Submit booking + upload Aadhar |
| GET | `/view-aadhar/:id` | Download Aadhar PDF (NEW) |
| GET | `/confirmation/:id` | Shows Aadhar info in confirmation |
| GET | `/bookings` | Lists bookings with Aadhar column |
| GET | `/admin/bookings` | Admin sees Aadhar in guest details |

---

## 🛡️ Validation Rules

### Aadhar Number
- Exactly 12 digits
- Numbers only (0-9)
- Server validates format

### File Upload
- Accepted formats: `.pdf`, `.jpg`, `.jpeg`
- Max size: 5MB
- Automatically deleted if validation fails
- Unique filename with timestamp

---

## 📋 Testing

### Test Booking with Aadhar:
1. Go to `/rooms`
2. Click on a room
3. Fill booking form with:
   - Aadhar: `123456789012` (12 digits)
   - Upload a PDF or JPG file
4. Submit form
5. Verify on confirmation page
6. Download Aadhar from confirmation

### Test Admin View:
1. Go to `/admin/bookings`
2. View booking details
3. See Aadhar number and download option

---

## 📚 File Structure

### models/Booking.js
```javascript
// New fields
aadharNumber: String (12 digits, required),
aadharPdf: String (file path, optional),
aadharUploadDate: Date (auto-set on upload)
```

### routes/index.js
```javascript
// New route
GET /view-aadhar/:id  // Download Aadhar document
POST /book/:id        // Handle Aadhar upload with multer
```

### views/bookingForm.ejs
```html
<!-- New fields -->
<input type="text" name="aadharNumber" pattern="[0-9]{12}" />
<input type="file" name="aadharPdf" accept=".pdf,.jpg,.jpeg" />
```

---

## 🔍 MongoDB Queries

### View All Bookings with Aadhar:
```javascript
db.bookings.find({ aadharNumber: { $exists: true } })
```

### Find Pending Bookings:
```javascript
db.bookings.find({ status: "Pending" })
```

### View All Rooms:
```javascript
db.rooms.find({})
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service

### File Upload Not Working
```
ENOENT: no such file or directory
```
**Solution**: Ensure `public/uploads/aadhar/` directory exists

### Aadhar Validation Failed
```
Aadhar number must be 12 digits
```
**Solution**: Enter exactly 12 numbers, no spaces

---

## 📊 Database Collections

### rooms Collection
- Stores room information
- Fields: name, type, price, amenities, utilities, etc.

### bookings Collection
- Stores booking information
- Includes: guestName, email, phone, **aadharNumber**, **aadharPdf**, etc.
- References room via ObjectId

---

## 🎓 Development Notes

### Adding Custom Validation
Edit `middleware/upload.js` to change:
- Accepted file types
- File size limit
- File naming convention

### Changing Upload Directory
Edit `middleware/upload.js`:
```javascript
const uploadDir = path.join(__dirname, '../public/uploads/aadhar');
```

### Changing MongoDB Connection
Edit `.env` file:
```
MONGODB_URI=your_new_connection_string
```

---

## ✨ Next Steps (Optional Enhancements)

- Add Aadhar verification API integration
- Email notifications on booking
- Aadhar document scanning/OCR
- Booking payment integration
- SMS confirmations
- Admin Aadhar document viewer

---

## 📞 Support

All functionality is documented in:
- `IMPLEMENTATION_COMPLETE.md` - Full technical documentation
- `config/database.js` - Database setup
- `middleware/upload.js` - File upload configuration
- Route files - Inline comments

Ready to deploy! 🚀
