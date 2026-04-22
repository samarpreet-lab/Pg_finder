const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB().catch(err => console.error('DB connection failed:', err.message));

app.use(session({
  secret: 'stayease-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session?.userId;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => res.status(404).render('404', { title: 'Page Not Found' }));

app.listen(PORT, () => console.log(`StayEase running at http://localhost:${PORT}`));
