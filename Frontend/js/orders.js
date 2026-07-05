 /**
 * ============================================================
 * orders.js
 * FoodExpress - My Orders
 * ============================================================
 */

const ORDER_STATUS_BADGE = {
  pending: "bg-warning text-dark",
  confirmed: "bg-info text-dark",
  preparing: "bg-primary",
  "out for delivery": "bg-secondary",
  delivered: "bg-success",
  cancelled: "bg-danger",
};

function extractOrders(res) {
  if (Array.isArray(res)) return res;

  if (Array.isArray(res?.orders)) return res.orders;

  if (Array.isArray(res?.data)) return res.data;

  if (Array.isArray(res?.data?.orders)) return res.data.orders;

  return [];
}

// ==============================
// API Calls
// ==============================

async function fetchMyOrders() {
  return await api.get("/orders");
}

async function cancelOrder(orderId) {
  return await api.put(`/orders/${orderId}`, {
    status: "Cancelled",
  });
}

 

// ==============================
// Currency
// ==============================

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

// ==============================
// Escape HTML
// ==============================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.innerText = text ?? "";
  return div.innerHTML;
}

// ============================================
// Load Orders
// ============================================

async function loadOrdersPage() {

    const container = document.getElementById("orders-list");

    const emptyState = document.getElementById("orders-empty-state");

    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">

            <div class="spinner-border text-success"></div>

            <p class="mt-3">

                Loading Your Orders...

            </p>

        </div>
    `;

    if (emptyState) {

        emptyState.classList.add("d-none");

    }

    try {

        const response = await fetchMyOrders();

        const orders = extractOrders(response);

        if (!orders.length) {

            container.innerHTML = "";

            if (emptyState) {

                emptyState.classList.remove("d-none");

            }

            return;

        }

        // Latest Orders First

        orders.sort((a, b) => {

            return new Date(b.createdAt) - new Date(a.createdAt);

        });

        container.innerHTML = orders
            .map(renderOrderCard)
            .join("");

        attachOrderEvents();

    }

    catch (error) {

        container.innerHTML = `

            <div class="alert alert-danger">

                ${escapeHtml(error.message)}

            </div>

        `;

    }

}

// ============================================
// Render Order Card
// ============================================

function renderOrderCard(order) {

    const id = order._id || order.id;

    const status = (order.status || "Pending").toLowerCase();

    const badgeClass =
        ORDER_STATUS_BADGE[status] || "bg-secondary";

    const paymentStatus =
        order.paymentStatus || "Pending";

    const paymentBadge =
        paymentStatus === "Paid"
            ? `<span class="badge bg-success">Paid</span>`
            : paymentStatus === "Failed"
            ? `<span class="badge bg-danger">Failed</span>`
            : `<span class="badge bg-warning text-dark">Pending</span>`;

    const paymentMethod =
        order.paymentMethod || "Cash On Delivery";

    const paymentDate = order.paymentDate
        ? new Date(order.paymentDate).toLocaleString()
        : "-";

    const estimatedDelivery =
        status === "delivered"
            ? "Delivered"
            : "30-40 Minutes";

    const items = order.items || [];

    const total =
        order.totalPrice || 0;

    const placedOn =
        order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "-";

    const canCancel =
        ["pending", "confirmed"].includes(status);

    // Timeline

    const steps = [

        "Pending",

        "Confirmed",

        "Preparing",

        "Out For Delivery",

        "Delivered"

    ];

    const currentStep = steps.findIndex(

        step =>

            step.toLowerCase() ===

            status

    );

    const progressHTML = `

    <div class="mt-3">

        ${steps.map((step,index)=>`

        <div class="d-flex align-items-center mb-2">

            <div
                style="
                width:16px;
                height:16px;
                border-radius:50%;
                margin-right:10px;
                background:${
                    index<=currentStep
                    ? "#198754"
                    : "#dee2e6"
                };
                ">
            </div>

            <span>

                ${step}

            </span>

        </div>

        `).join("")}

    </div>

    `;

    return `

<div class="card shadow-sm border-0 mb-4">

<div class="card-body">

<div class="d-flex justify-content-between">

<div>

<h5>

Order #

${escapeHtml(

String(id)

.slice(-6)

.toUpperCase()

)}

</h5>

<div class="text-muted">

${placedOn}

</div>

<div class="mt-2">

<strong>

Payment :

</strong>

${paymentMethod}

</div>

<div>

<strong>

Paid On :

</strong>

${paymentDate}

</div>

<div class="text-success">

Estimated Delivery :

${estimatedDelivery}

</div>

</div>

<div class="text-end">

<span class="badge ${badgeClass}">

${escapeHtml(order.status)}

</span>

<br><br>

${paymentBadge}

</div>

</div>

${progressHTML}

<hr>

<ul class="list-group list-group-flush">

${items.map(item=>`

<li class="list-group-item
d-flex
justify-content-between">

<div>

${escapeHtml(

item.foodId?.name ||

item.food?.name ||

item.name ||

"Food"

)}

×

${item.quantity}

</div>

<div>

${formatCurrency(

(item.foodId?.price ??

item.food?.price ??

item.price ??

0)

*

(item.quantity ?? 1)

)}

</div>

</li>

`).join("")}

</ul>

<hr>

<div class="d-flex
justify-content-between
align-items-center">

<div>

<h5 class="text-success">

${formatCurrency(total)}

</h5>

${order.razorpayPaymentId
?`

<small class="text-muted">

Payment ID :

<br>

${order.razorpayPaymentId}

</small>

`
:""}

</div>

 <div class="d-flex gap-2">

${
canCancel
?

`
<button
class="btn btn-outline-danger fe-cancel-order"
data-id="${id}">
Cancel Order
</button>
`

:
""
}

 <button
class="btn btn-success"
onclick="window.open('receipt.html?id=${id}','_blank')">
Receipt
</button>

<button

class="btn btn-primary"

onclick="window.location='track.html?id=${id}'">

Track

</button>

</div>

</div>

</div>

</div>

`;

}


// ============================================
// Order Events
// ============================================

function attachOrderEvents() {

    const cancelButtons =
        document.querySelectorAll(".fe-cancel-order");

    cancelButtons.forEach((button) => {

        button.addEventListener("click", async () => {

            const orderId = button.dataset.id;

            const confirmCancel = confirm(
                "Are you sure you want to cancel this order?"
            );

            if (!confirmCancel) return;

            button.disabled = true;

            button.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Cancelling...
            `;

            try {

                const response = await cancelOrder(orderId);

                if (response.success) {

                    showAlert(
                        "Order Cancelled Successfully",
                        "success"
                    );

                    await loadOrdersPage();

                } else {

                    throw new Error(
                        response.message ||
                        "Unable to cancel order."
                    );

                }

            }

            catch (error) {

                showAlert(
                    error.message,
                    "danger"
                );

                button.disabled = false;

                button.innerHTML = "Cancel Order";

            }

        });

    });

}

const receiptButtons =
    document.querySelectorAll(".fe-download-receipt");

receiptButtons.forEach(button => {

    button.addEventListener("click", () => {

        const id = button.dataset.id;

        window.open(
            `receipt.html?id=${id}`,
            "_blank"
        );

    });

});
 
document.addEventListener("DOMContentLoaded", () => {

    if (
        document.getElementById("orders-list") &&
        requireAuth()
    ) {

        loadOrdersPage();

        setInterval(loadOrdersPage, 30000);

    }

});