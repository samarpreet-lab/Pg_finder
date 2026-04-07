// StayEase - Main JavaScript File
// This file manages client-side form helpers, navigation state, and UI behavior.

// Set minimum date for check-in and check-out fields to today's date.
document.addEventListener('DOMContentLoaded', function() {
  const today = new Date().toISOString().split('T')[0];
  const checkInInputs = document.querySelectorAll('input[name="checkIn"]');
  const checkOutInputs = document.querySelectorAll('input[name="checkOut"]');
  
  checkInInputs.forEach(input => {
    input.setAttribute('min', today);
  });
  
  checkOutInputs.forEach(input => {
    input.setAttribute('min', today);
  });
  
  // When the check-in date changes, ensure check-out cannot be earlier than the check-in date.
  checkInInputs.forEach(input => {
    input.addEventListener('change', function() {
      const checkOutInput = this.closest('form').querySelector('input[name="checkOut"]');
      if (checkOutInput) {
        checkOutInput.setAttribute('min', this.value);
        if (checkOutInput.value && checkOutInput.value < this.value) {
          checkOutInput.value = this.value;
        }
      }
    });
  });
});

// Confirm delete actions for any forms that are intended to remove data.
document.querySelectorAll('form[action*="DELETE"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    if (!confirm('Are you sure you want to delete this item?')) {
      e.preventDefault();
    }
  });
});

// Auto-hide alert messages after a short delay.
setTimeout(function() {
  const alerts = document.querySelectorAll('.alert:not(.alert-warning):not(.alert-dark)');
  alerts.forEach(alert => {
    alert.style.transition = 'opacity 0.5s ease';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  });
}, 5000);

// Highlight the active sidebar or navigation link based on the current page path.
const currentPath = window.location.pathname;
document.querySelectorAll('.sidebar-nav-link, .nav-link-luxury').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
    link.classList.add('active');
  }
});

// Highlight regular nav links too, if they match the current route.
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  }
});

console.log('🏨 StayEase loaded successfully!');
