// ===== Zentrales Admin-System =====
// SHA-256 Hash des Admin-Passworts
const ADMIN_PASSWORD_HASH = 'a9d5b1efde4fa888bcde914dd1eec6b67011b32af8e57a242a497a5156298fc4';
const GUESTBOOK_AVAILABLE_DATE = new Date(2026, 5, 15);
const ABLAUFPLAN_AVAILABLE_DATE = new Date(2026, 5, 15);
const BUFFET_AVAILABLE_DATE = new Date(2026, 5, 15);
const DANKSAGUNG_AVAILABLE_DATE = new Date(2026, 5, 20);
let isAdmin = false;

// Sichere localStorage Zugriffe mit Fehlerbehandlung
function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? (key === 'adminLoggedIn' ? item === 'true' : JSON.parse(item)) : defaultValue;
  } catch (e) {
    console.warn(`Fehler beim Lesen von ${key}:`, e);
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, key === 'adminLoggedIn' ? String(value) : JSON.stringify(value));
  } catch (e) {
    console.warn(`Fehler beim Speichern von ${key}:`, e);
  }
}

// Feature-Sichtbarkeit mit Loop
function checkFeatureAvailability() {
  const today = new Date();
  const features = {
    guestbookLink: isAdmin || today >= GUESTBOOK_AVAILABLE_DATE ? 'inline-block' : 'none',
    ablaufplanLink: isAdmin || today >= ABLAUFPLAN_AVAILABLE_DATE ? 'inline-block' : 'none',
    buffetLink: isAdmin || today >= BUFFET_AVAILABLE_DATE ? 'inline-block' : 'none',
    danksagungLink: isAdmin || today >= DANKSAGUNG_AVAILABLE_DATE ? 'inline-block' : 'none',
    historyLink: isAdmin ? 'inline-block' : 'none',
    adminLink: isAdmin ? 'inline-block' : 'none',
    guestListSection: isAdmin ? 'block' : 'none'
  };
  
  Object.entries(features).forEach(([id, display]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = display;
  });
}

// Admin-Status prüfen und UI aktualisieren
function checkAdminStatus() {
  isAdmin = getFromStorage('adminLoggedIn', false);
  updateAdminUI();
  checkFeatureAvailability();
}

// Admin-Modus umschalten
function toggleAdminMode(enable) {
  isAdmin = enable;
  saveToStorage('adminLoggedIn', enable);
  const msg = enable ? 'Admin-Modus aktiviert!' : 'Admin-Modus deaktiviert.';
  alert(msg);
  updateAdminUI();
  checkFeatureAvailability();
  window.dispatchEvent(new Event('adminStateChanged'));
}

// SHA-256 Hash-Funktion
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Admin-Login
async function adminLogin() {
  const password = prompt('Admin-Passwort eingeben:');
  if (password === null) return;
  
  const hash = await hashPassword(password);
  if (hash === ADMIN_PASSWORD_HASH) {
    toggleAdminMode(true);
  } else {
    alert('Falsches Passwort!');
  }
}

// Admin-Logout
function adminLogout() {
  if (confirm('Admin-Modus beenden?')) {
    toggleAdminMode(false);
  }
}

// UI aktualisieren
function updateAdminUI() {
  const btn = document.getElementById('adminToggle');
  if (btn) {
    btn.textContent = isAdmin ? '🔓' : '🔒';
    btn.title = isAdmin ? 'Admin abmelden' : 'Admin anmelden';
  }
}

// Hamburger Menu
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if (!hamburger || !navMenu) return;
  
  const toggle = () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  };
  
  hamburger.addEventListener('click', toggle);
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  const adminBtn = document.getElementById('adminToggle');
  if (adminBtn) {
    adminBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (isAdmin) {
        adminLogout();
      } else {
        await adminLogin();
      }
    });
  }
  initHamburgerMenu();
  checkAdminStatus();
});

// Export
window.isAdminMode = () => isAdmin;
window.getFromStorage = getFromStorage;
window.saveToStorage = saveToStorage;
