const express = require('express');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

app.use(function(req, res) {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.listen(PORT, function() {
  console.log('StayEase PG running at http://localhost:' + PORT);
});
