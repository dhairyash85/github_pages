if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/PWA/service-worker.js")
      .then((registration) => {
        console.log("✅ Service Worker registered successfully:", registration);

        // Request notification permission
        return Notification.requestPermission();
      })
      .then((permission) => {
        if (permission === "granted") {
          console.log("✅ Notification permission granted.");
        } else if (permission === "denied") {
          console.log("❌ Notification permission denied. Please enable notifications in your browser settings.");
          alert("Notification permission denied. Please enable notifications in your browser settings.");
        } else {
          console.log("⚠ Notification permission dismissed.");
        }
      })
      .catch((error) => {
        console.log("❌ Service Worker registration failed:", error);
      });
  });
} else {
  console.log("⚠ Service Workers are not supported in this browser.");
}

// Handle install banner
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  const installBanner = document.getElementById('install-banner');
  installBanner.classList.remove('hidden');
});

document.getElementById('install-button').addEventListener('click', (e) => {
  // Hide the app provided install promotion
  const installBanner = document.getElementById('install-banner');
  installBanner.classList.add('hidden');
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
  });
});

document.getElementById('dismiss-button').addEventListener('click', () => {
  const installBanner = document.getElementById('install-banner');
  installBanner.classList.add('hidden');
});

// Handle cart functionality
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartCountElement = document.querySelector('.cart-count');
let cartCount = 0;

// Load cart from local storage if available
window.addEventListener('load', () => {
  const savedCart = JSON.parse(localStorage.getItem('furnirent-cart') || '[]');
  cartCount = savedCart.length;
  cartCountElement.textContent = cartCount;
});

addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    cartCount++;
    cartCountElement.textContent = cartCount;
    
    // Get product details
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('.price').textContent;
    const rentalPeriod = productCard.querySelector('.rental-period').textContent;
    
    // Show notification
    alert(`Added to cart: ${productName} - ${productPrice} ${rentalPeriod}`);
    
    // Save to local storage (for offline functionality)
    saveToCart({
      name: productName,
      price: productPrice,
      period: rentalPeriod,
      date: new Date().toISOString()
    });
  });
});

// Save cart data to localStorage for offline use
function saveToCart(item) {
  let cart = JSON.parse(localStorage.getItem('furnirent-cart') || '[]');
  cart.push(item);
  localStorage.setItem('furnirent-cart', JSON.stringify(cart));
  
  // Trigger background sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('sync-cart')
        .then(() => console.log('Background sync registered!'))
        .catch(err => console.log('Background sync registration failed:', err));
    });
  }
}