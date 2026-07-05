/* ==========================================================
   track.js
   FoodExpress Order Tracking
========================================================== */

async function loadTracking() {

    try {

        const response = await api.get("/orders");

        const orders =
            response.orders ||
            response.data?.orders ||
            [];

        if (!orders.length) {

            showEmpty();

            return;

        }

        // Latest Order
        const order = orders.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        )[0];

        renderTracking(order);

    }

    catch (error) {

        console.log(error);

        alert("Unable to load tracking.");

    }

}

// ==========================================================
// Render Tracking
// ==========================================================

function renderTracking(order) {

    document.getElementById("orderId").innerText =
        order._id;

    document.getElementById("paymentStatus").innerHTML =

        order.paymentStatus === "Paid"

            ? `<span class="badge bg-success">Paid</span>`

            : `<span class="badge bg-warning text-dark">Pending</span>`;

    document.getElementById("paymentMethod").innerText =
        order.paymentMethod || "Cash On Delivery";

    updateTimeline(
        (order.status || "Pending").toLowerCase()
    );

}

// ==========================================================
// Timeline
// ==========================================================

function updateTimeline(status) {

    const dots = {

        confirmed: document.getElementById("confirmedDot"),

        preparing: document.getElementById("preparingDot"),

        delivery: document.getElementById("deliveryDot"),

        delivered: document.getElementById("deliveredDot")

    };

    Object.values(dots).forEach(dot => {

        dot.classList.remove("bg-success");

        dot.classList.add("bg-secondary");

    });

    switch (status) {

        case "confirmed":

            dots.confirmed.classList.replace(
                "bg-secondary",
                "bg-success"
            );

            break;

        case "preparing":

            dots.confirmed.classList.replace(
                "bg-secondary",
                "bg-success"
            );

            dots.preparing.classList.replace(
                "bg-secondary",
                "bg-success"
            );

            break;

        case "out for delivery":

            dots.confirmed.classList.replace(
                "bg-secondary",
                "bg-success"
            );

            dots.preparing.classList.replace(
                "bg-secondary",
                "bg-success"
            );

            dots.delivery.classList.replace(
                "bg-secondary",
                "bg-success"
            );

            break;

        case "delivered":

            Object.values(dots).forEach(dot => {

                dot.classList.replace(
                    "bg-secondary",
                    "bg-success"
                );

            });

            break;

    }

}

// ==========================================================
// Empty State
// ==========================================================

function showEmpty() {

    document.querySelector(".card-body").innerHTML = `

        <div class="text-center py-5">

            <h3>No Active Order</h3>

            <a
                href="orders.html"
                class="btn btn-success mt-3">

                My Orders

            </a>

        </div>

    `;

}

// ==========================================================
// Auto Refresh Every 30 Seconds
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    loadTracking();

    setInterval(loadTracking, 30000);

});