 /* ============================================================
   FoodExpress Cart
   Production Version
============================================================ */

let cartItems = [];

const DELIVERY_FEE = 40;

// DOM Elements
 const cartContainer = document.getElementById("cart-items-container");
 const subtotalElement=document.getElementById("cart-subtotal");
 const deliveryElement=document.getElementById("cart-delivery-fee");
 const totalElement=document.getElementById("cart-total");
 const addressInput=document.getElementById("checkout-address");
 const phoneInput=document.getElementById("checkout-phone");
 const paymentMethod=document.getElementById("checkout-payment");

const placeOrderBtn = document.getElementById("placeOrder");

function formatPrice(price) {
    return `₹${Number(price).toFixed(2)}`;
}


// ============================================
// Add To Cart
// ============================================

async function addToCart(foodId, quantity = 1) {

    try {

        const response = await api.post("/cart", {

            food: foodId,
            quantity

        });

        refreshCartBadge();

        return response;

    }

    catch (error) {

        console.error(error);

        throw error;

    }

}

// Make available globally
window.addToCart = addToCart;


async function loadCart() {

    try {

        const response = await api.get("/cart");

        cartItems = response.cart || response.data?.cart || [];

        renderCart();

    } catch (error) {

        console.error(error);

        showAlert(error.message, "danger");

    }

}
 

function renderCart() {

    const summaryCard = document.getElementById("cart-summary");
    const emptyState = document.getElementById("cart-empty-state");

    if (!cartContainer) return;

    // Empty Cart
    if (!cartItems.length) {

        cartContainer.innerHTML = "";

        summaryCard.classList.add("d-none");
        emptyState.classList.remove("d-none");

        return;
    }

    // Show Cart
    summaryCard.classList.remove("d-none");
    emptyState.classList.add("d-none");

    cartContainer.innerHTML = "";

    cartItems.forEach(item => {

        const food = item.food || item.foodId;

        cartContainer.insertAdjacentHTML("beforeend", `

<div class="card shadow-sm border-0 mb-3">

    <div class="card-body">

        <div class="row align-items-center">

            <div class="col-md-2 col-4">

                <img
                    src="${food.image}"
                    class="img-fluid rounded"
                    style="height:90px;width:100%;object-fit:cover;"
                >

            </div>

            <div class="col-md-4 col-8">

                <h5 class="mb-1">
                    ${food.name}
                </h5>

                <small class="text-muted">

                    ${formatPrice(food.price)} each

                </small>

            </div>

            <div class="col-md-3 mt-3 mt-md-0">

                <div class="btn-group">

                    <button
                        class="btn btn-outline-secondary"
                        onclick="decreaseQty('${item._id}')">

                        -

                    </button>

                    <button
                        class="btn btn-light"
                        disabled>

                        ${item.quantity}

                    </button>

                    <button
                        class="btn btn-outline-secondary"
                        onclick="increaseQty('${item._id}')">

                        +

                    </button>

                </div>

            </div>

            <div class="col-md-2 mt-3 mt-md-0">

                <strong>

                    ${formatPrice(food.price * item.quantity)}

                </strong>

            </div>

            <div class="col-md-1 text-end mt-3 mt-md-0">

                <button
                    class="btn btn-outline-danger btn-sm"
                    onclick="removeItem('${item._id}')">

                    <i class="bi bi-trash"></i>

                </button>

            </div>

        </div>

    </div>

</div>

        `);

    });

    updateSummary();

}

 function updateSummary() {

    let subtotal = 0;

    cartItems.forEach(item => {

        const food = item.food || item.foodId;

        subtotal += Number(food.price) * Number(item.quantity);

    });

    const delivery = cartItems.length > 0 ? DELIVERY_FEE : 0;

    const total = subtotal + delivery;

    document.getElementById("cart-subtotal").innerText =
        formatPrice(subtotal);

    document.getElementById("cart-delivery-fee").innerText =
        formatPrice(delivery);

    document.getElementById("cart-total").innerText =
        formatPrice(total);

}

async function increaseQty(cartId) {

    try {

        const item = cartItems.find(i => i._id === cartId);

        if (!item) return;

        await api.put(`/cart/${cartId}`, {
            quantity: item.quantity + 1
        });

        await loadCart();

        refreshCartBadge();

    } catch (error) {

        console.error(error);

        showAlert(error.message, "danger");

    }

}

async function decreaseQty(cartId) {

    try {

        const item = cartItems.find(i => i._id === cartId);

        if (!item) return;

        if (item.quantity <= 1) {

            return removeItem(cartId);

        }

        await api.put(`/cart/${cartId}`, {
            quantity: item.quantity - 1
        });

        await loadCart();

        refreshCartBadge();

    } catch (error) {

        console.error(error);

        showAlert(error.message, "danger");

    }

}

async function removeItem(cartId) {

    if (!confirm("Remove this item from cart?")) return;

    try {

        await api.delete(`/cart/${cartId}`);

        await loadCart();

        refreshCartBadge();

        showAlert("Item removed from cart", "success");

    } catch (error) {

        console.error(error);

        showAlert(error.message, "danger");

    }

}

 function getCartTotal() {

    let subtotal = 0;

    cartItems.forEach(item => {

        const food = item.food || item.foodId;

        subtotal += Number(food.price) * Number(item.quantity);

    });

    return subtotal + (cartItems.length ? DELIVERY_FEE : 0);

}

function prepareOrderItems() {

    return cartItems.map(item => {

        const food = item.food || item.foodId;

        return {

            foodId: food._id,

            quantity: item.quantity,

            price: food.price,

            name: food.name

        };

    });

}

 

function validateCheckout() {

    if (!addressInput.value.trim()) {

        showAlert("Please enter delivery address", "warning");

        return false;

    }

    if (!phoneInput.value.trim()) {

        showAlert("Please enter phone number", "warning");

        return false;

    }

    if (phoneInput.value.trim().length < 10) {

        showAlert("Invalid phone number", "warning");

        return false;

    }

    if (cartItems.length === 0) {

        showAlert("Cart is empty", "warning");

        return false;

    }

    return true;

}

 
const checkoutForm = document.getElementById("checkout-form");

checkoutForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateCheckout()) return;

    const method = paymentMethod.value;

    if (method === "Cash on Delivery") {

        return placeCODOrder();

    }

    if (
        method === "Credit / Debit Card" ||
        method === "UPI"
    ) {

        return startOnlinePayment();

    }

});


async function placeCODOrder() {

    try {

        placeOrderBtn.disabled = true;

        const orderData = {

            items: prepareOrderItems(),

            address: addressInput.value.trim(),

            phone: phoneInput.value.trim(),

            totalPrice: getCartTotal(),

             paymentMethod: "Cash on Delivery",

            paymentStatus: "Pending"

        };

        const response = await api.post("/orders", orderData);

        if (!response.success) {

            throw new Error(response.message);

        }

        showAlert("Order Placed Successfully", "success");
           

        await clearBackendCart();

        cartItems = [];
        renderCart();
        localStorage.removeItem("cart");



        refreshCartBadge();

        setTimeout(() => {

        window.location.href = "orders.html";

    },1000);

    }

    catch (error) {

        console.error(error);

        showAlert(error.message, "danger");

    }

    finally {

        placeOrderBtn.disabled = false;

    }

}

async function startOnlinePayment() {

    try {

        placeOrderBtn.disabled = true;

        const paymentData = {

            totalPrice: getCartTotal(),

            items: prepareOrderItems(),

            address: addressInput.value.trim(),

            phone: phoneInput.value.trim(),

            paymentMethod: paymentMethod.value

        };

       await payWithRazorpay(paymentData);

    }

    catch (error) {

        console.error(error);

        showAlert(error.message, "danger");

    }

    finally {

        placeOrderBtn.disabled = false;

    }

}

function setCheckoutLoading(isLoading) {

    if (isLoading) {

        placeOrderBtn.disabled = true;

        placeOrderBtn.innerHTML =

        `<span class="spinner-border spinner-border-sm"></span>
        Processing...`;

    }

    else {

        placeOrderBtn.disabled = false;

        placeOrderBtn.innerHTML =

        "Place Order";

    }

}

 document.addEventListener("DOMContentLoaded", () => {

    if (!requireAuth()) return;

    loadCart();

    refreshCartBadge();

});

 async function clearBackendCart() {

    try {

        await api.delete("/cart/clear");

    } catch (error) {

        console.error(error);

    }

}


async function paymentSuccess() {

    await clearBackendCart();

    refreshCartBadge();

    showAlert(
        "Order Placed Successfully",
        "success"
    );

    setTimeout(() => {

        window.location.href = "orders.html";

    }, 1200);

}

function paymentFailed(message) {

    showAlert(

        message ||

        "Payment Failed",

        "danger"

    );

}


 


window.addEventListener("focus", () => {

    loadCart();

});