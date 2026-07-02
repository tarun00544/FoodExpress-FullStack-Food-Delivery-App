 /**
 * menu.js
 * ---------------------------------------------------------------------------
 * Talks to GET /api/foods (list + filters) and GET /api/foods/:id (detail).
 * Used by both menu.html (full catalogue with filters) and index.html
 * (featured foods strip on the homepage).
 *
 * NOTE ON RESPONSE SHAPE: this file defensively unwraps a few common
 * response shapes ({data:[...]}, {foods:[...]}, [...]) so it works whether
 * your backend wraps the list or returns it directly. If your controller
 * uses a different key, adjust `extractList()` below.
 * ---------------------------------------------------------------------------
 */

const MENU_STATE = {
  keyword: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sort: "",
  page: 1,
  limit: 9,
};

/** extractList - pulls the array of foods out of whatever shape the API returns */
function extractList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.foods)) return res.foods;
  if (Array.isArray(res?.data?.foods)) return res.data.foods;
  return [];
}

/** extractMeta - pulls pagination info (page/pages/total) out of the response */
function extractMeta(res) {
  return {
    page: res?.page || res?.data?.page || MENU_STATE.page,
    pages: res?.pages || res?.totalPages || res?.data?.pages || 1,
    total: res?.total || res?.count || res?.data?.total || 0,
  };
}

/** fetchFoods - GET /api/foods with query params */
async function fetchFoods(params) {
  return api.get("/foods", params, false);
}

/** fetchFoodById - GET /api/foods/:id */
async function fetchFoodById(id) {
  return api.get(`/foods/${id}`, null, false);
}

/** foodImage - fall back to a placeholder if backend gives no image */
function foodImage(food) {
  return food.image || food.imageUrl || food.photo || "images/placeholder-food.svg";
}

/** renderFoodCard - returns HTML string for a single food card */
function renderFoodCard(food) {
  const id = food._id || food.id;
  const name = escapeHtml(food.name || food.title || "Untitled dish");
  const category = escapeHtml(food.category || "");
  const price = formatCurrency(food.price);
  const rating = food.rating || food.avgRating || food.ratings || 0;
  const outOfStock = food.stock === 0 || food.available === false;

  return `
  <div class="col-sm-6 col-lg-4 fe-food-col" data-id="${id}">
    <div class="fe-card h-100 d-flex flex-column">
      <div class="position-relative">
        <a href="menu.html?id=${id}">
          <img src="${foodImage(food)}" alt="${name}" class="w-100" style="height:190px;object-fit:cover;" onerror="this.src='images/placeholder-food.svg'">
        </a>
        <button class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-2 fe-wishlist-btn" data-id="${id}" title="Add to wishlist">
          <i class="bi bi-heart"></i>
        </button>
        ${outOfStock ? '<span class="badge bg-secondary position-absolute bottom-0 start-0 m-2">Out of stock</span>' : ""}
      </div>
      <div class="fe-scallop"></div>
      <div class="p-3 d-flex flex-column flex-grow-1">
        ${category ? `<span class="fe-spice-dot mb-2 align-self-start">${category}</span>` : ""}
        <h6 class="mb-1"><a href="menu.html?id=${id}" class="text-decoration-none text-forest">${name}</a></h6>
        <p class="text-muted-fe small mb-2 flex-grow-1">${escapeHtml((food.description || "").slice(0, 70))}${(food.description || "").length > 70 ? "…" : ""}</p>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="fw-bold text-forest fs-5">${price}</span>
          <span class="small text-muted-fe"><i class="bi bi-star-fill fe-rating-star"></i> ${Number(rating).toFixed(1)}</span>
        </div>
        <button class="btn btn-fe-primary w-100 fe-add-to-cart-btn" data-id="${id}" ${outOfStock ? "disabled" : ""}>
          <i class="bi bi-cart-plus me-1"></i> Add to Cart
        </button>
      </div>
    </div>
  </div>`;
}

/** renderSkeletons - loading placeholders while foods are fetched */
function renderSkeletons(container, count = 6) {
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="col-sm-6 col-lg-4">
      <div class="fe-card">
        <div class="fe-skeleton" style="height:190px;"></div>
        <div class="p-3">
          <div class="fe-skeleton mb-2" style="height:14px;width:60%;"></div>
          <div class="fe-skeleton mb-2" style="height:18px;width:85%;"></div>
          <div class="fe-skeleton" style="height:36px;width:100%;"></div>
        </div>
      </div>
    </div>`).join("");
}

/** attachCardEvents - wires up add-to-cart / wishlist buttons within a container */
function attachCardEvents(container) {
  container.querySelectorAll(".fe-add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!isLoggedIn()) {
        showAlert("Please log in to add items to your cart.", "warning");
        setTimeout(() => (window.location.href = "login.html"), 900);
        return;
      }
      setButtonLoading(btn, true, "Adding...");
      try {
        await addToCart(btn.dataset.id, 1);
        showAlert("Added to cart!", "success");
        refreshCartBadge();
      } catch (err) {
        showAlert(err.message, "danger");
      } finally {
        setButtonLoading(btn, false);
      }
    });
  });

  container.querySelectorAll(".fe-wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!isLoggedIn()) {
        showAlert("Please log in to use your wishlist.", "warning");
        setTimeout(() => (window.location.href = "login.html"), 900);
        return;
      }
      try {
        await addToWishlist(btn.dataset.id);
        btn.innerHTML = '<i class="bi bi-heart-fill text-danger"></i>';
        showAlert("Added to wishlist!", "success");
      } catch (err) {
        showAlert(err.message, "danger");
      }
    });
  });
}

/* ============================ MENU PAGE (menu.html) ========================= */

async function loadMenu() {
  const grid = document.getElementById("food-grid");
  const emptyState = document.getElementById("menu-empty-state");
  const paginationEl = document.getElementById("menu-pagination");
  if (!grid) return;

  emptyState.classList.add("d-none");
  renderSkeletons(grid);

  try {
    const params = {
      keyword: MENU_STATE.keyword,
      category: MENU_STATE.category,
      minPrice: MENU_STATE.minPrice,
      maxPrice: MENU_STATE.maxPrice,
      sort: MENU_STATE.sort,
      page: MENU_STATE.page,
      limit: MENU_STATE.limit,
    };
    const res = await fetchFoods(params);
    const foods = extractList(res);
    const meta = extractMeta(res);

    if (!foods.length) {
      grid.innerHTML = "";
      emptyState.classList.remove("d-none");
      paginationEl.innerHTML = "";
      return;
    }

    grid.innerHTML = foods.map(renderFoodCard).join("");
    attachCardEvents(grid);
    renderPagination(meta.page, meta.pages);
  } catch (err) {
    grid.innerHTML = `<div class="col-12"><div class="alert alert-danger">${escapeHtml(err.message)}</div></div>`;
    paginationEl.innerHTML = "";
  }
}
 function renderPagination(currentPage, totalPages) {

    const pagination = document.getElementById("menu-pagination");
    pagination.innerHTML = "";

    // Previous
    const prev = document.createElement("li");
    prev.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;

    prev.innerHTML = `
        <a class="page-link" href="#">« Previous</a>
    `;

    prev.onclick = (e) => {
        e.preventDefault();
        if(currentPage > 1){
            MENU_STATE.page--;
             loadMenu();
        }
    };

    pagination.appendChild(prev);

     let start = currentPage;
let end = currentPage + 2;

if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - 3);
}

    for(let i=start;i<=end;i++){

        const li = document.createElement("li");

        li.className = `page-item ${i===currentPage?"active":""}`;

        li.innerHTML = `
            <a class="page-link" href="#">${i}</a>
        `;

        li.onclick = (e)=>{
            e.preventDefault();
            MENU_STATE.page=i;
           loadMenu();
        };

        pagination.appendChild(li);
    }

    // Next

    const next=document.createElement("li");

    next.className=`page-item ${currentPage===totalPages?"disabled":""}`;

    next.innerHTML=`
        <a class="page-link" href="#">Next »</a>
    `;

    next.onclick=(e)=>{

        e.preventDefault();

        if(currentPage<totalPages){

            MENU_STATE.page++;

            loadMenu();

        }

    };

    pagination.appendChild(next);

}

/** loadCategoryOptions - populate category <select> from the food list itself
 *  (derives distinct categories client-side so we don't need a separate endpoint) */
async function loadCategoryOptions() {
  const select = document.getElementById("filter-category");
  if (!select) return;
  try {
    const res = await fetchFoods({ limit: 100 });
    const foods = extractList(res);
    const categories = [...new Set(foods.map((f) => f.category).filter(Boolean))];
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
  } catch (err) {
    // Non-critical - filters just won't have category options
  }
}

function initMenuFilters() {
  const searchInput = document.getElementById("filter-keyword");
  const categorySelect = document.getElementById("filter-category");
  const minPriceInput = document.getElementById("filter-min-price");
  const maxPriceInput = document.getElementById("filter-max-price");
  const sortSelect = document.getElementById("filter-sort");
  const filterForm = document.getElementById("filter-form");
  const resetBtn = document.getElementById("filter-reset");

  if (!filterForm) return;

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    MENU_STATE.keyword = searchInput.value.trim();
    MENU_STATE.category = categorySelect.value;
    MENU_STATE.minPrice = minPriceInput.value;
    MENU_STATE.maxPrice = maxPriceInput.value;
    MENU_STATE.sort = sortSelect.value;
    MENU_STATE.page = 1;
    loadMenu();
  });

  resetBtn.addEventListener("click", () => {
    filterForm.reset();
    Object.assign(MENU_STATE, { keyword: "", category: "", minPrice: "", maxPrice: "", sort: "", page: 1 });
    loadMenu();
  });

  // Live search-as-you-type with debounce
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      MENU_STATE.keyword = searchInput.value.trim();
      MENU_STATE.page = 1;
      loadMenu();
    }, 400);
  });
}

/** initFoodDetailModal - if ?id=<foodId> is present, show detail view + reviews */
async function initFoodDetailModal() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const modalEl = document.getElementById("food-detail-modal");
  if (!id || !modalEl) return;

  const body = document.getElementById("food-detail-body");
  body.innerHTML = `<div class="fe-loader"><div class="spinner-border text-forest"></div></div>`;
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  try {
    const res = await fetchFoodById(id);
    const food = res.data || res.food || res;
    renderFoodDetail(food);
    await loadReviews(id);
  } catch (err) {
    body.innerHTML = `<div class="alert alert-danger">${escapeHtml(err.message)}</div>`;
  }
}

function renderFoodDetail(food) {
  const body = document.getElementById("food-detail-body");
  document.getElementById("food-detail-title").textContent = food.name || food.title;
  body.innerHTML = `
    <div class="row g-4">
      <div class="col-md-5">
        <img src="${foodImage(food)}" class="img-fluid rounded-4" alt="${escapeHtml(food.name)}" onerror="this.src='images/placeholder-food.svg'">
      </div>
      <div class="col-md-7">
        ${food.category ? `<span class="fe-spice-dot mb-2">${escapeHtml(food.category)}</span>` : ""}
        <p class="text-muted-fe">${escapeHtml(food.description || "No description available.")}</p>
        <h3 class="text-forest">${formatCurrency(food.price)}</h3>
        <button class="btn btn-fe-primary mt-2 fe-add-to-cart-btn" data-id="${food._id || food.id}">
          <i class="bi bi-cart-plus me-1"></i> Add to Cart
        </button>
      </div>
    </div>
    <hr class="my-4">
    <h6 class="mb-3">Reviews</h6>
    <div id="review-list"><div class="fe-loader"><div class="spinner-border spinner-border-sm text-forest"></div></div></div>
    ${isLoggedIn() ? `
    <form id="review-form" class="mt-3">
      <div class="mb-2">
        <select class="form-select form-select-sm w-auto d-inline-block" id="review-rating">
          ${[5,4,3,2,1].map((n) => `<option value="${n}">${n} ★</option>`).join("")}
        </select>
      </div>
      <textarea class="form-control mb-2" id="review-comment" rows="2" placeholder="Share your thoughts..." required></textarea>
      <button class="btn btn-fe-outline btn-sm" type="submit">Submit Review</button>
    </form>` : `<p class="small text-muted-fe">Log in to leave a review.</p>`}
  `;
  attachCardEvents(body);

  const reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = reviewForm.querySelector("button");
      setButtonLoading(btn, true, "Posting...");
      try {
        await api.post("/reviews", {
          foodId: food._id || food.id,
          rating: Number(document.getElementById("review-rating").value),
          comment: document.getElementById("review-comment").value.trim(),
        });
        showAlert("Review submitted!", "success");
        reviewForm.reset();
        await loadReviews(food._id || food.id);
      } catch (err) {
        showAlert(err.message, "danger");
      } finally {
        setButtonLoading(btn, false);
      }
    });
  }
}

async function loadReviews(foodId) {
  const list = document.getElementById("review-list");
  try {
    const res = await api.get(`/reviews/${foodId}`);
    const reviews = extractList(res).length ? extractList(res) : (Array.isArray(res) ? res : []);
    if (!reviews.length) {
      list.innerHTML = `<p class="small text-muted-fe">No reviews yet — be the first!</p>`;
      return;
    }
    list.innerHTML = reviews.map((r) => `
      <div class="border-bottom py-2">
        <div class="d-flex justify-content-between">
          <strong class="small">${escapeHtml(r.user?.name || r.userName || "Anonymous")}</strong>
          <span class="small">${"★".repeat(r.rating || 0)}<span class="text-muted-fe">${"★".repeat(5 - (r.rating || 0))}</span></span>
        </div>
        <p class="small text-muted-fe mb-0">${escapeHtml(r.comment || "")}</p>
      </div>
    `).join("");
  } catch (err) {
    list.innerHTML = `<p class="small text-danger">${escapeHtml(err.message)}</p>`;
  }
}

/* =========================== FEATURED FOODS (index.html) ==================== */
async function loadFeaturedFoods() {
  const container = document.getElementById("featured-food-grid");
  if (!container) return;
  renderSkeletons(container, 6);
  try {
    const res = await fetchFoods({ limit: 6, sort: "-createdAt" });
    const foods = extractList(res);
    if (!foods.length) {
      container.innerHTML = `<div class="col-12 fe-empty-state"><i class="bi bi-egg-fried"></i><p>No dishes available yet. Check back soon!</p></div>`;
      return;
    }
    container.innerHTML = foods.map(renderFoodCard).join("");
    attachCardEvents(container);
  } catch (err) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${escapeHtml(err.message)}</div></div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedFoods();
  if (document.getElementById("food-grid")) {
    loadCategoryOptions();
    initMenuFilters();
    loadMenu();
    initFoodDetailModal();
  }
});
