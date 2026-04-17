const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

// Create the Express application instance.
const app = express();
const PORT = process.env.PORT || 3001;

// Session middleware configuration
app.use(session({
  secret: 'stayease-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Middleware to parse incoming form data and JSON payloads.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets like CSS, images, and client JavaScript.
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the template engine and point to the views folder.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load route modules for public and admin pages.
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

// Mount the public routes at '/' and admin routes at '/admin'.
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

// Handle any unknown route with a custom 404 page.
app.use(function(req, res) {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Start the HTTP server and listen on the configured port.
app.listen(PORT, function() {
  console.log('StayEase PG running at http://localhost:' + PORT);
});
