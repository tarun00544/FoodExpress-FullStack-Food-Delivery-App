/**
 * auth.js
 * ---------------------------------------------------------------------------
 * Handles: shared navbar rendering (injected on every page), login form,
 * register form, logout, and keeping the cart badge in sync.
 * Depends on api.js being loaded first.
 * ---------------------------------------------------------------------------
 */

/** renderNavbar - injects the shared navbar into #fe-navbar-placeholder */
function renderNavbar(activePage = "") {
  const placeholder = document.getElementById("fe-navbar-placeholder");
  if (!placeholder) return;

  const loggedIn = isLoggedIn();
  const user = getUser();
  const admin = isAdmin();

  const navLink = (href, label, page) =>
    `<li class="nav-item"><a class="nav-link ${activePage === page ? "active" : ""}" href="${href}">${label}</a></li>`;

  placeholder.innerHTML = `
  <nav class="navbar navbar-expand-lg fe-navbar">
    <div class="container">
    <button
    id="backBtn"
    class="fe-back-btn d-none"
    onclick="goBack()">

    <i class="bi bi-arrow-left"></i>

</button>
      <a class="navbar-brand" href="index.html"><span class="fe-brand-dot"></span>FoodExpress</a>
      <button class="navbar-toggler border-0 text-white" type="button" data-bs-toggle="collapse" data-bs-target="#feNavContent">
        <i class="bi bi-list text-white fs-2"></i>
      </button>
      <div class="collapse navbar-collapse" id="feNavContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
          ${navLink("index.html", "Home", "home")}
          ${navLink("menu.html", "Menu", "menu")}
          ${loggedIn ? navLink("orders.html", "My Orders", "orders") : ""}
          ${admin ? navLink("admin.html", "Admin", "admin") : ""}
        </ul>
        <ul class="navbar-nav align-items-lg-center gap-lg-2">
          ${loggedIn ? `
            <li class="nav-item">
              <a class="nav-link fe-nav-icon-link" href="wishlist.html" title="Wishlist">
                <i class="bi bi-heart fs-5"></i>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link fe-nav-icon-link" href="cart.html" title="Cart">
                <i class="bi bi-cart3 fs-5"></i>
                <span class="fe-cart-badge d-none" id="fe-cart-badge">0</span>
              </a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle fs-5"></i>
                <span class="d-none d-lg-inline">${escapeHtml(user?.name?.split(" ")[0] || "Account")}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>Profile</a></li>
                <li><a class="dropdown-item" href="orders.html"><i class="bi bi-receipt me-2"></i>Orders</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" id="fe-logout-btn"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
              </ul>
            </li>
          ` : `
            <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
            <li class="nav-item">
              <a class="btn btn-fe-accent btn-sm ms-lg-2" href="register.html">Sign Up</a>
            </li>
          `}
        </ul>
      </div>
    </div>
  </nav>`;

  const logoutBtn = document.getElementById("fe-logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  if (loggedIn) refreshCartBadge();
  // ===========================
// Show Back Button
// ===========================

const backBtn = document.getElementById("backBtn");

const currentPage = window.location.pathname
    .split("/")
    .pop();

if (backBtn && currentPage !== "index.html") {

    backBtn.classList.remove("d-none");

}
}
function goBack(){

    if(window.history.length > 1){

        window.history.back();

    }else{

        window.location.href = "index.html";

    }

}
 
/** refreshCartBadge - fetches cart, updates the badge count on the navbar */
async function refreshCartBadge() {
  const badge = document.getElementById("fe-cart-badge");
  if (!badge) return;
  try {
    const res = await api.get("/cart");
    const items = res?.data?.items || res?.items || res?.data || [];
    const count = Array.isArray(items) ? items.reduce((sum, it) => sum + (it.quantity || 1), 0) : 0;
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : count;
      badge.classList.remove("d-none");
    } else {
      badge.classList.add("d-none");
    }
  } catch (err) {
    // Silently ignore - badge just won't update
  }
}

/** handleLogout - clears session and redirects home */
function handleLogout() {
  clearSession();
  showAlert("You have been logged out.", "info");
  setTimeout(() => (window.location.href = "index.html"), 800);
}

/* =============================== LOGIN FORM ================================ */
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  if (isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorBox = document.getElementById("login-error");
    errorBox.classList.add("d-none");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    setButtonLoading(submitBtn, true, "Logging in...");
    try {
      const res = await api.post("/auth/login", { email, password }, false);
      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;
      if (!token) throw new Error("Login response did not include a token.");

      saveSession(token, user);
      showAlert(`Welcome back, ${user?.name || "there"}!`, "success");
      const redirectTo = new URLSearchParams(window.location.search).get("redirect");
      setTimeout(() => (window.location.href = redirectTo || "index.html"), 700);
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("d-none");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ============================= REGISTER FORM ================================ */
function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  if (isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorBox = document.getElementById("register-error");
    errorBox.classList.add("d-none");

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;

    if (password !== confirmPassword) {
      errorBox.textContent = "Passwords do not match.";
      errorBox.classList.remove("d-none");
      return;
    }
    if (password.length < 6) {
      errorBox.textContent = "Password must be at least 6 characters.";
      errorBox.classList.remove("d-none");
      return;
    }

    setButtonLoading(submitBtn, true, "Creating account...");
    try {
      const res = await api.post("/auth/register", { name, email, password }, false);
      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;

      if (token && user) {
        saveSession(token, user);
        showAlert("Account created! Welcome to FoodExpress.", "success");
        setTimeout(() => (window.location.href = "index.html"), 700);
      } else {
        showAlert("Account created! Please log in.", "success");
        setTimeout(() => (window.location.href = "login.html"), 900);
      }
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("d-none");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

 document.addEventListener("DOMContentLoaded", () => {

  let page = "";

  if (location.pathname.includes("index")) page = "home";
  else if (location.pathname.includes("menu")) page = "menu";
  else if (location.pathname.includes("orders")) page = "orders";
  else if (location.pathname.includes("admin")) page = "admin";

  renderNavbar(page);

  initLoginForm();
  initRegisterForm();

});
