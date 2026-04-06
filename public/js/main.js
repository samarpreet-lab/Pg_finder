// StayEase - Main JavaScript File

// Set minimum date for date inputs to today
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
  
  // Update checkout min date when checkin changes
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

// Confirm delete actions
document.querySelectorAll('form[action*="DELETE"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    if (!confirm('Are you sure you want to delete this item?')) {
      e.preventDefault();
    }
  });
});

// Auto-hide alerts after 5 seconds
setTimeout(function() {
  const alerts = document.querySelectorAll('.alert:not(.alert-warning):not(.alert-dark)');
  alerts.forEach(alert => {
    alert.style.transition = 'opacity 0.5s ease';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  });
}, 5000);

// Sidebar navigation active state
const currentPath = window.location.pathname;
document.querySelectorAll('.sidebar-nav-link, .nav-link-luxury').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
    link.classList.add('active');
  }
});

// Regular nav links
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  }
});

console.log('🏨 StayEase loaded successfully!');
