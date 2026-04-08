/* ═══════════════════════════════════════
   FoodSaver – script.js
   All shared client-side logic
═══════════════════════════════════════ */

let allFoods = [];

/* ── AUTH CHECK ── */
async function checkAuth() {
  const res = await fetch('/me');
  const data = await res.json();
  if (!data.loggedIn) {
    location.href = 'login.html';
    return;
  }
  const navUser = document.getElementById('navUser');
  if (navUser) navUser.textContent = '👤 ' + data.username;

  const greetMsg = document.getElementById('greetMsg');
  if (greetMsg) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    greetMsg.textContent = `${greeting}, ${data.username}! Here's your food overview.`;
  }
}

/* ── LOGOUT ── */
async function logout() {
  await fetch('/logout', { method: 'POST' });
  location.href = 'login.html';
}

/* ── UNIT DETECTION ── */
function detectUnit(food) {
  food = food.toLowerCase();
  if (food.includes('rice') || food.includes('wheat') || food.includes('flour') || food.includes('sugar')) return 'kg';
  if (food.includes('milk') || food.includes('juice') || food.includes('oil') || food.includes('water')) return 'litre';
  if (food.includes('chips') || food.includes('biscuit') || food.includes('snack') || food.includes('packet')) return 'packet';
  if (food.includes('bread') || food.includes('roti') || food.includes('chapati')) return 'pieces';
  if (food.includes('egg')) return 'pieces';
  if (food.includes('butter') || food.includes('cheese') || food.includes('ghee')) return 'g';
  if (food.includes('onion') || food.includes('potato') || food.includes('tomato') || food.includes('garlic')) return 'kg';
  if (food.includes('apple') || food.includes('banana') || food.includes('orange') || food.includes('mango')) return 'pieces';
  if (food.includes('dal') || food.includes('lentil') || food.includes('bean') || food.includes('pulse')) return 'kg';
  return 'units';
}

/* ── FOOD ICON ── */
function foodIcon(food) {
  food = food.toLowerCase();
  if (food.includes('rice'))    return '🍚';
  if (food.includes('milk'))    return '🥛';
  if (food.includes('bread') || food.includes('roti')) return '🍞';
  if (food.includes('apple'))   return '🍎';
  if (food.includes('banana'))  return '🍌';
  if (food.includes('mango'))   return '🥭';
  if (food.includes('orange'))  return '🍊';
  if (food.includes('egg'))     return '🥚';
  if (food.includes('chips') || food.includes('snack')) return '🍟';
  if (food.includes('oil') || food.includes('ghee'))    return '🫙';
  if (food.includes('onion'))   return '🧅';
  if (food.includes('tomato'))  return '🍅';
  if (food.includes('potato'))  return '🥔';
  if (food.includes('carrot'))  return '🥕';
  if (food.includes('water'))   return '💧';
  if (food.includes('juice'))   return '🧃';
  if (food.includes('cheese'))  return '🧀';
  if (food.includes('butter'))  return '🧈';
  if (food.includes('dal') || food.includes('lentil')) return '🫘';
  if (food.includes('chicken') || food.includes('meat')) return '🍗';
  if (food.includes('fish'))    return '🐟';
  if (food.includes('sugar'))   return '🍬';
  if (food.includes('salt'))    return '🧂';
  if (food.includes('garlic'))  return '🧄';
  return '🍽️';
}

/* ── LOAD FOODS (for inventory page) ── */
async function loadFoods() {
  const list = document.getElementById('foodList');
  if (!list) return;

  try {
    const res = await fetch('/foods');
    if (res.status === 401) { location.href = 'login.html'; return; }
    const foods = await res.json();
    allFoods = foods;
    applyFilters();
    checkExpiryAlert(foods);
  } catch (e) {
    list.innerHTML = `<div class="alert alert-danger">Failed to load foods. Is the server running?</div>`;
  }
}

/* ── APPLY ALL FILTERS ── */
function applyFilters() {
  const searchText  = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const typeVal     = document.getElementById('typeFilter')?.value || 'all';
  const expiryVal   = document.getElementById('expiryFilter')?.value || 'all';
  const today       = new Date();

  let filtered = allFoods.filter(food => {
    const nameMatch = food.name.toLowerCase().includes(searchText);

    const typeMatch = typeVal === 'all' || food.type === typeVal;

    const diff = (new Date(food.expiryDate) - today) / (1000 * 60 * 60 * 24);
    let expiryMatch = true;
    if (expiryVal === 'expiring') expiryMatch = diff <= 5 && diff >= 0;
    if (expiryVal === 'fresh')    expiryMatch = diff > 5;
    if (expiryVal === 'expired')  expiryMatch = diff < 0;

    return nameMatch && typeMatch && expiryMatch;
  });

  renderFoods(filtered);
}

function searchFood()  { applyFilters(); }
function filterFood()  { applyFilters(); }

/* ── RENDER FOOD CARDS ── */
function renderFoods(foods) {
  const list = document.getElementById('foodList');
  const countBadge = document.getElementById('itemCount');
  if (!list) return;

  if (countBadge) countBadge.textContent = foods.length;

  if (foods.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h5>No items found</h5>
        <p>Try adjusting your filters or <a href="addFood.html" style="color:var(--primary)">add some groceries</a>.</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'row g-3';

  foods.forEach((food, i) => {
    const icon = foodIcon(food.name);
    const today = new Date();
    const expiry = new Date(food.expiryDate);
    const purchase = new Date(food.purchaseDate);
    const totalDays = Math.max(1, (expiry - purchase) / (1000 * 60 * 60 * 24));
    const diff = (expiry - today) / (1000 * 60 * 60 * 24);

    // Color logic
    let barColor, daysClass, daysText;
    if (diff < 0) {
      barColor = 'bg-secondary';
      daysClass = 'days-expired';
      daysText = `Expired ${Math.abs(Math.ceil(diff))}d ago`;
    } else if (diff <= 2) {
      barColor = 'bg-danger';
      daysClass = 'days-danger';
      daysText = diff < 1 ? 'Expires today!' : `${Math.ceil(diff)}d left`;
    } else if (diff <= 5) {
      barColor = 'bg-warning';
      daysClass = 'days-warn';
      daysText = `${Math.ceil(diff)}d left`;
    } else {
      barColor = 'bg-success';
      daysClass = 'days-safe';
      daysText = `${Math.ceil(diff)}d left`;
    }

    const percent = Math.max(0, Math.min(100, (diff / totalDays) * 100));
    const expiryFormatted = expiry.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.style.animationDelay = (i * 0.05) + 's';
    col.innerHTML = `
      <div class="food-card">
        <div class="food-header">
          <div class="food-emoji">${icon}</div>
          <div class="flex-fill">
            <p class="food-name">${food.name}</p>
            <p class="food-qty">${food.quantity} ${food.unit}</p>
          </div>
          <span class="badge-type badge-${food.type}">${food.type}</span>
        </div>
        <div class="food-body">
          <div class="expiry-row">
            <span class="expiry-label">📅 Expires: ${expiryFormatted}</span>
            <span class="expiry-days ${daysClass}">${daysText}</span>
          </div>
          <div class="progress mb-3">
            <div class="progress-bar ${barColor}" style="width:${percent}%"></div>
          </div>
          <button class="btn btn-danger btn-sm w-100" onclick="deleteFood('${food._id}')">
            🗑️ Remove
          </button>
        </div>
      </div>`;
    row.appendChild(col);
  });

  list.appendChild(row);
}

/* ── DELETE FOOD ── */
async function deleteFood(id) {
  if (!confirm('Remove this item from inventory?')) return;
  await fetch('/foods/' + id, { method: 'DELETE' });
  showToast('Item removed from inventory', 'success');
  loadFoods();
}

/* ── EXPIRY ALERT BANNER ── */
function checkExpiryAlert(foods) {
  const alertBox = document.getElementById('expiryAlert');
  if (!alertBox) return;

  const today = new Date();
  const expiring = foods.filter(f => {
    const diff = (new Date(f.expiryDate) - today) / (1000 * 60 * 60 * 24);
    return diff <= 2 && diff >= 0;
  });

  const expired = foods.filter(f => new Date(f.expiryDate) < today);

  let html = '';
  if (expiring.length > 0) {
    html += `<div class="expiry-alert-banner">
      ⚠️ ${expiring.length} item${expiring.length > 1 ? 's' : ''} expiring within 2 days:
      <strong>${expiring.map(f => f.name).join(', ')}</strong>
    </div>`;
  }
  if (expired.length > 0) {
    html += `<div class="expiry-alert-banner" style="border-left-color:#ef4444;background:#fef2f2;color:#991b1b;margin-bottom:10px">
      🗑️ ${expired.length} item${expired.length > 1 ? 's have' : ' has'} expired: 
      <strong>${expired.map(f => f.name).join(', ')}</strong>
    </div>`;
  }
  alertBox.innerHTML = html;
}

/* ── ANIMATE COUNTER (dashboard) ── */
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  if (end === 0) { obj.textContent = '0'; return; }
  const range = end - start;
  const stepTime = Math.max(20, Math.floor(duration / range));
  let current = start;
  const timer = setInterval(() => {
    current++;
    obj.textContent = current;
    if (current >= end) clearInterval(timer);
  }, stepTime);
}

/* ── TOAST NOTIFICATIONS ── */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-custom ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
