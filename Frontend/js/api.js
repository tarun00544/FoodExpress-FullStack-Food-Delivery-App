/**
 * api.js
 * ---------------------------------------------------------------------------
 * Central API layer for FoodExpress frontend.
 * Every other JS file calls into the helpers exported here instead of
 * calling fetch() directly. This keeps auth headers, error handling and
 * base URL configuration in exactly one place.
 * ---------------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// CONFIG - change this to your deployed backend URL when you go live.
// ---------------------------------------------------------------------------
 const API_BASE_URL =
"https://foodexpress-fullstack-food-delivery-app.onrender.com/api"; // <-- change this to your deployed backend URL when you go live

// LocalStorage keys (kept in one place so we never typo a string key)
const STORAGE_KEYS = {
  TOKEN: "fe_token",
  USER: "fe_user",
  CART_COUNT: "fe_cart_count",
};

/* ============================= AUTH STORAGE ============================= */

function saveSession(token, user) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.CART_COUNT);
}

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function getUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return !!user && user.role === "admin";
}

/* ============================ CORE REQUEST =============================== */

/**
 * apiRequest - wraps fetch() with base URL, JSON parsing, auth header
 * injection and consistent error shape.
 *
 * @param {string} endpoint - e.g. "/foods" or "/cart/64f..."
 * @param {object} options  - { method, body, auth, params }
 * @returns {Promise<any>}  - parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, auth = true, params } = options;

  // Build query string if params object was provided
  let url = `${API_BASE_URL}${endpoint}`;
  if (params && Object.keys(params).length) {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
      )
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers = { "Content-Type": "application/json" };

  // Automatically attach JWT bearer token when required/available
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body !== undefined) config.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    // Backend unreachable / CORS / offline
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  // Handle unauthorized / forbidden globally
  if (response.status === 401) {
    clearSession();
    const isAuthPage = /login\.html|register\.html|index\.html$/i.test(window.location.pathname) ||
      window.location.pathname === "/" ;
    if (!isAuthPage) {
      showAlert("Your session has expired. Please log in again.", "warning");
      setTimeout(() => (window.location.href = "login.html"), 1200);
    }
    throw new Error("Unauthorized");
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

/* =============================== SHORTCUTS =============================== */

const api = {
  get: (endpoint, params, auth = true) => apiRequest(endpoint, { method: "GET", params, auth }),
  post: (endpoint, body, auth = true) => apiRequest(endpoint, { method: "POST", body, auth }),
  put: (endpoint, body, auth = true) => apiRequest(endpoint, { method: "PUT", body, auth }),
  delete: (endpoint, auth = true) => apiRequest(endpoint, { method: "DELETE", auth }),
};

/* ============================ UI UTILITIES ================================ */

/**
 * showAlert - shows a Bootstrap-styled toast in the top-right corner.
 * type: 'success' | 'danger' | 'warning' | 'info'
 */
function showAlert(message, type = "info") {
  let container = document.getElementById("fe-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "fe-toast-container";
    container.style.position = "fixed";
    container.style.top = "1rem";
    container.style.right = "1rem";
    container.style.zIndex = "2000";
    container.style.minWidth = "280px";
    document.body.appendChild(container);
  }

  const icon = {
    success: "bi-check-circle-fill",
    danger: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  }[type] || "bi-info-circle-fill";

  const toast = document.createElement("div");
  toast.className = `fe-toast fe-toast-${type}`;
  toast.innerHTML = `<i class="bi ${icon} me-2"></i><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/** toggleLoading - shows/hides a spinner inside a target element */
function setButtonLoading(button, loading, loadingText = "Please wait...") {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${loadingText}`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

/** requireAuth - redirect to login if not authenticated. Call at top of protected pages. */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

/** requireAdmin - redirect non-admins away from admin.html */
function requireAdmin() {
  if (!requireAuth()) return false;
  if (!isAdmin()) {
    showAlert("Admin access only.", "danger");
    setTimeout(() => (window.location.href = "index.html"), 1200);
    return false;
  }
  return true;
}

/** formatCurrency - consistent price formatting across the app */
function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toFixed(2)}`;
}

/** escapeHtml - guards against XSS when injecting backend text into innerHTML */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
// ================= EXPORT TO GLOBAL WINDOW =================

window.api = api;

window.showAlert = showAlert;
window.escapeHtml = escapeHtml;
window.formatCurrency = formatCurrency;

window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;

window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;

window.getToken = getToken;
window.getUser = getUser;

window.saveSession = saveSession;
window.clearSession = clearSession;

window.setButtonLoading = setButtonLoading;
