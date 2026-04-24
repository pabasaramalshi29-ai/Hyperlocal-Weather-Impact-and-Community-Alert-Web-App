// script.js

// Loading animation
document.addEventListener('DOMContentLoaded', () => {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loading);

    setTimeout(() => {
        loading.style.display = 'none';
    }, 2000);
});

// Initialize Google Maps
function initMap() {
    // Default location (e.g., New York)
    const defaultLocation = { lat: 40.7128, lng: -74.0060 };

    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: defaultLocation,
    });

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                });
            },
            () => {
                // Handle location error
                console.log('Geolocation failed');
            }
        );
    }

    // Add some sample alert markers
    const alerts = [
        { lat: 40.7128, lng: -74.0060, title: 'Flood Alert' },
        { lat: 40.7589, lng: -73.9851, title: 'Power Outage' },
    ];

    alerts.forEach(alert => {
        new google.maps.Marker({
            position: alert,
            map: map,
            title: alert.title,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            },
        });
    });
}

// Search functionality (placeholder)
document.getElementById('search-btn')?.addEventListener('click', () => {
    const location = document.getElementById('location-search').value;
    alert(`Searching for weather in: ${location}`);
});

// Form submission (placeholder)
document.querySelector('.report-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Alert submitted successfully!');
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

// Observe elements for fade-in
document.querySelectorAll('.alert-card, .weather-card, .alert-banner, .map-container, .report-form').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// Mobile menu toggle
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.createElement('div');
hamburger.innerHTML = '<i class="fas fa-bars"></i>';
hamburger.classList.add('hamburger');
hamburger.style.display = 'none';
hamburger.style.cursor = 'pointer';
hamburger.style.fontSize = '1.5rem';

document.querySelector('.navbar .container').appendChild(hamburger);

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Show hamburger on mobile
if (window.innerWidth <= 768) {
    hamburger.style.display = 'block';
}

window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        hamburger.style.display = 'block';
    } else {
        hamburger.style.display = 'none';
        navMenu.classList.remove('active');
    }
});