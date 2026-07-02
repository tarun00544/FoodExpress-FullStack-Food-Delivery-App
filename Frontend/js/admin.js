/**
 * admin.js
 * ---------------------------------------------------------------------------
 * Powers admin.html. Access is gated by requireAdmin() (redirects non-admins).
 * Talks to: /api/admin/dashboard, /api/admin/orders, /api/admin/users,
 * /api/admin/analytics, and full CRUD on /api/foods.
 * ---------------------------------------------------------------------------
 */

/* ============================== DASHBOARD ==================================== */

async function loadAdminDashboard() {
  const el = document.getElementById("admin-stats");
  if (!el) return;
  el.innerHTML = statCardSkeletons();

  try {
    const res = await api.get("/admin/dashboard");
     const stats =
    res.dashboard ||
    res.data?.dashboard ||
    res.data ||
    res;
    el.innerHTML = `
      ${statCard("bi-currency-rupee", "Total Revenue", formatCurrency(stats.totalRevenue || stats.revenue || 0), "fe-forest")}
      ${statCard("bi-bag-check", "Total Orders", stats.totalOrders ?? stats.orders ?? 0, "fe-saffron")}
      ${statCard("bi-people", "Total Users", stats.totalUsers ?? stats.users ?? 0, "fe-tomato")}
      ${statCard("bi-egg-fried", "Total Foods", stats.totalFoods ?? stats.foods ?? 0, "fe-forest-light")}
    `;
  } catch (err) {
    el.innerHTML = `<div class="col-12"><div class="alert alert-danger">${escapeHtml(err.message)}</div></div>`;
  }
}

function statCard(icon, label, value, accent) {
  return `
  <div class="col-sm-6 col-lg-3">
    <div class="fe-card p-3 h-100">
      <i class="bi ${icon} fs-3 text-forest"></i>
      <h3 class="mt-2 mb-0">${value}</h3>
      <span class="small text-muted-fe">${label}</span>
    </div>
  </div>`;
}

function statCardSkeletons() {
  return Array.from({ length: 4 }).map(() => `
    <div class="col-sm-6 col-lg-3">
      <div class="fe-card p-3"><div class="fe-skeleton" style="height:60px;"></div></div>
    </div>`).join("");
}

/* ============================ FOOD MANAGEMENT (CRUD) ========================= */

async function loadAdminFoods() {
  const tbody = document.getElementById("admin-foods-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-forest"></div></td></tr>`;

  try {
    const res = await fetchFoods({ limit: 100 });
    const foods = extractList(res);
    if (!foods.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted-fe py-4">No food items yet. Add your first dish!</td></tr>`;
      return;
    }
    tbody.innerHTML = foods.map((f) => `
      <tr>
        <td><img src="${f.image || 'images/placeholder-food.svg'}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;" onerror="this.src='images/placeholder-food.svg'"></td>
        <td>${escapeHtml(f.name)}</td>
        <td>${escapeHtml(f.category || "-")}</td>
        <td>${formatCurrency(f.price)}</td>
        <td>${f.stock ?? "-"}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-fe-outline fe-edit-food" data-id="${f._id || f.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger fe-delete-food" data-id="${f._id || f.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`).join("");

    tbody.querySelectorAll(".fe-edit-food").forEach((btn) => btn.addEventListener("click", () => openFoodModal(btn.dataset.id, foods)));
    tbody.querySelectorAll(".fe-delete-food").forEach((btn) => btn.addEventListener("click", () => deleteFoodItem(btn.dataset.id)));
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert-danger mb-0">${escapeHtml(err.message)}</div></td></tr>`;
  }
}

function openFoodModal(id, foodsCache) {
  const modalEl = document.getElementById("food-modal");
  const modal = new bootstrap.Modal(modalEl);
  const form = document.getElementById("food-form");
  form.reset();
  document.getElementById("food-modal-title").textContent = id ? "Edit Food Item" : "Add Food Item";
  document.getElementById("food-id").value = id || "";

  if (id) {
    const food = foodsCache.find((f) => (f._id || f.id) === id);
    if (food) {
      document.getElementById("food-name").value = food.name || "";
      document.getElementById("food-category").value = food.category || "";
      document.getElementById("food-price").value = food.price || "";
      document.getElementById("food-stock").value = food.stock ?? "";
      document.getElementById("food-image").value = food.image || "";
      document.getElementById("food-description").value = food.description || "";
    }
  }
  modal.show();
}

function initFoodForm() {
  const form = document.getElementById("food-form");
  if (!form) return;

  document.getElementById("add-food-btn")?.addEventListener("click", () => openFoodModal(null, []));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const errorBox = document.getElementById("food-form-error");
    errorBox.classList.add("d-none");

    const id = document.getElementById("food-id").value;
    const payload = {
      name: document.getElementById("food-name").value.trim(),
      category: document.getElementById("food-category").value.trim(),
      price: Number(document.getElementById("food-price").value),
      stock: Number(document.getElementById("food-stock").value) || 0,
      image: document.getElementById("food-image").value.trim(),
      description: document.getElementById("food-description").value.trim(),
    };

    setButtonLoading(btn, true, "Saving...");
    try {
      if (id) {
        await api.put(`/foods/${id}`, payload);
        showAlert("Food item updated!", "success");
      } else {
        await api.post("/foods", payload);
        showAlert("Food item added!", "success");
      }
      bootstrap.Modal.getInstance(document.getElementById("food-modal")).hide();
      loadAdminFoods();
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("d-none");
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

async function deleteFoodItem(id) {
  if (!confirm("Delete this food item permanently?")) return;
  try {
    await api.delete(`/foods/${id}`);
    showAlert("Food item deleted.", "info");
    loadAdminFoods();
  } catch (err) {
    showAlert(err.message, "danger");
  }
}

/* ============================== ORDER MANAGEMENT ============================== */

async function loadAdminOrders() {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-forest"></div></td></tr>`;

  try {
    const res = await api.get("/admin/orders");
    const orders = extractOrders(res);
    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted-fe py-4">No orders yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = orders.map((o) => `
      <tr>
        <td>#${escapeHtml(String(o._id || o.id).slice(-6).toUpperCase())}</td>
        <td>${escapeHtml(o.user?.name || o.userName || "Guest")}</td>
        <td>${formatCurrency(o.totalAmount || o.total || 0)}</td>
        <td>
          <select class="form-select form-select-sm fe-order-status" data-id="${o._id || o.id}" style="min-width:140px;">
            ${["pending","processing","out for delivery","delivered","cancelled"].map((s) =>
              `<option value="${s}" ${((o.status || "pending").toLowerCase() === s) ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
        <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</td>
        <td class="text-end"><button class="btn btn-sm btn-outline-danger fe-delete-order" data-id="${o._id || o.id}"><i class="bi bi-trash"></i></button></td>
      </tr>`).join("");

    tbody.querySelectorAll(".fe-order-status").forEach((sel) => {
      sel.addEventListener("change", async () => {
        try {
          await api.put(`/orders/${sel.dataset.id}`, { status: sel.value });
          showAlert("Order status updated.", "success");
        } catch (err) {
          showAlert(err.message, "danger");
        }
      });
    });
    tbody.querySelectorAll(".fe-delete-order").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this order?")) return;
        try {
          await api.delete(`/orders/${btn.dataset.id}`);
          showAlert("Order deleted.", "info");
          loadAdminOrders();
        } catch (err) {
          showAlert(err.message, "danger");
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert-danger mb-0">${escapeHtml(err.message)}</div></td></tr>`;
  }
}

/* ================================ USERS ======================================= */

async function loadAdminUsers() {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-forest"></div></td></tr>`;

  try {
    const res = await api.get("/admin/users");
    const users = Array.isArray(res) ? res : (res?.data || res?.users || []);
    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted-fe py-4">No users found.</td></tr>`;
      return;
    }
    tbody.innerHTML = users.map((u) => `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${u.role === "admin" ? "bg-forest" : "bg-secondary"} text-capitalize">${escapeHtml(u.role || "user")}</span></td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="alert alert-danger mb-0">${escapeHtml(err.message)}</div></td></tr>`;
  }
}

/* =============================== ANALYTICS ===================================== */

async function loadAdminAnalytics() {
  const el = document.getElementById("admin-analytics-content");
  if (!el) return;
  el.innerHTML = `<div class="fe-loader"><div class="spinner-border text-forest"></div></div>`;

  try {
    const res = await api.get("/admin/analytics");
     const data =
    res.analytics ||
    res.data?.analytics ||
    res.data ||
    res;
    const entries = Object.entries(data || {});
    if (!entries.length) {
      el.innerHTML = `<p class="text-muted-fe">No analytics data available yet.</p>`;
      return;
    }
    el.innerHTML = `<div class="row g-3">${entries.map(([key, value]) => `
      <div class="col-sm-6 col-lg-4">
        <div class="fe-card p-3">
          <span class="small text-muted-fe text-capitalize">${escapeHtml(key.replace(/([A-Z])/g, " $1"))}</span>
          <h5 class="mb-0 mt-1">${typeof value === "object" ? JSON.stringify(value) : escapeHtml(String(value))}</h5>
        </div>
      </div>`).join("")}</div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${escapeHtml(err.message)}</div>`;
  }
}

/* ============================== TAB NAVIGATION ================================= */

function initAdminTabs() {
  const tabs = document.querySelectorAll("#admin-tabs button[data-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", () => {
      const target = tab.dataset.tab;
      if (target === "dashboard") loadAdminDashboard();
      if (target === "foods") loadAdminFoods();
      if (target === "orders") loadAdminOrders();
      if (target === "users") loadAdminUsers();
      if (target === "analytics") loadAdminAnalytics();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("admin-stats") && requireAdmin()) {
    loadAdminDashboard();
    initAdminTabs();
    initFoodForm();
  }
});
