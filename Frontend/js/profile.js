/**
 * profile.js
 * ---------------------------------------------------------------------------
 * Powers profile.html. Reads the cached user from localStorage for instant
 * paint, then (if your backend exposes it) refreshes from the server.
 *
 * NOTE: the brief didn't list a dedicated "GET /api/users/me" endpoint, so
 * this reads/writes through whatever your backend exposes for updating a
 * profile. If your route differs from PUT /api/auth/profile, update the two
 * endpoints below.
 * ---------------------------------------------------------------------------
 */

const PROFILE_UPDATE_ENDPOINT = "/auth/profile"; // adjust if your backend differs

async function loadProfilePage() {
  const form = document.getElementById("profile-form");
  if (!form) return;

  const user = getUser();
  if (user) fillProfileForm(user);

  // Try to refresh from server if a "me" style endpoint exists; ignore failure
  try {
    const res = await api.get(PROFILE_UPDATE_ENDPOINT);
    const fresh = res?.data || res?.user || res;
    if (fresh && typeof fresh === "object") fillProfileForm(fresh);
  } catch (err) {
    // Endpoint may not exist / may be write-only - fall back to cached user silently
  }
}

function fillProfileForm(user) {
  document.getElementById("profile-name").value = user.name || "";
  document.getElementById("profile-email").value = user.email || "";
  document.getElementById("profile-phone").value = user.phone || "";
  document.getElementById("profile-address").value = user.address || "";
  const roleBadge = document.getElementById("profile-role-badge");
  if (roleBadge) roleBadge.textContent = user.role === "admin" ? "Admin" : "Customer";
}

function initProfileForm() {
  const form = document.getElementById("profile-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const errorBox = document.getElementById("profile-error");
    errorBox.classList.add("d-none");

    const payload = {
      name: document.getElementById("profile-name").value.trim(),
      phone: document.getElementById("profile-phone").value.trim(),
      address: document.getElementById("profile-address").value.trim(),
    };

    setButtonLoading(btn, true, "Saving...");
    try {
      const res = await api.put(PROFILE_UPDATE_ENDPOINT, payload);
      const updatedUser = res?.data || res?.user || { ...getUser(), ...payload };
      localStorage.setItem("fe_user", JSON.stringify(updatedUser));
      showAlert("Profile updated successfully!", "success");
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("d-none");
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

function initPasswordForm() {
  const form = document.getElementById("password-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const errorBox = document.getElementById("password-error");
    errorBox.classList.add("d-none");

    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-new-password").value;

    if (newPassword !== confirmPassword) {
      errorBox.textContent = "New passwords do not match.";
      errorBox.classList.remove("d-none");
      return;
    }

    setButtonLoading(btn, true, "Updating...");
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      showAlert("Password updated successfully!", "success");
      form.reset();
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("d-none");
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("profile-form") && requireAuth()) {
    loadProfilePage();
    initProfileForm();
    initPasswordForm();
  }
});
