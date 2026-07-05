 // ============================================
// Wishlist API
// ============================================

async function addToWishlist(foodId) {
  return await api.post("/wishlist", {
    food: foodId,
  });
}

async function getWishlist() {
  return await api.get("/wishlist");
}

async function removeFromWishlist(id) {
  return await api.delete(`/wishlist/${id}`);
}

// ============================================
// Load Wishlist Page
// ============================================

async function loadWishlistPage() {

  const grid = document.getElementById("wishlist-grid");

  const empty = document.getElementById("wishlist-empty-state");

  if (!grid) return;

  grid.innerHTML = "<h4>Loading...</h4>";

  try {

    const res = await getWishlist();

    const wishlist = res.wishlist || [];

    if (wishlist.length === 0) {

      grid.innerHTML = "";

      if (empty)  grid.classList.add("d-none");
empty.classList.remove("d-none");
      return;

    }

    if (empty)  grid.classList.remove("d-none");
empty.classList.add("d-none");

    grid.innerHTML = "";

    wishlist.forEach(item => {

      const food = item.food;

      grid.innerHTML += `

      <div class="col-md-4 mb-4">

        <div class="card h-100 shadow">

          <img src="${food.image}" class="card-img-top" height="220" style="object-fit:cover;">

          <div class="card-body">

            <h5>${food.name}</h5>

            <p>${food.description}</p>

            <h4>₹${food.price}</h4>

            <button
              class="btn btn-success w-100 mb-2"
              onclick="addWishlistToCart('${food._id}')">

              Add To Cart

            </button>

            <button
              class="btn btn-danger w-100"
              onclick="deleteWishlist('${item._id}')">

              Remove

            </button>

          </div>

        </div>

      </div>

      `;

    });

  }

  catch (err) {

    grid.innerHTML = `

      <div class="alert alert-danger">

        ${err.message}

      </div>

    `;

  }

}

// ============================================
// Delete Wishlist
// ============================================

async function deleteWishlist(id) {

  if (!confirm("Remove this item?")) return;

  try {

    await removeFromWishlist(id);

    showAlert("Removed From Wishlist", "success");

    loadWishlistPage();

  }

  catch (err) {

    showAlert(err.message, "danger");

  }

}

// ============================================
// Add Wishlist Item To Cart
// ============================================

async function addWishlistToCart(foodId) {

  try {

    await api.post("/cart", {

      food: foodId,

      quantity: 1,

    });

    showAlert("Added To Cart", "success");

  }

  catch (err) {

    showAlert(err.message, "danger");

  }

}

// ============================================
// Start
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  loadWishlistPage();

});