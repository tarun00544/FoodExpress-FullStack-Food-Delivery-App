/* ==========================================================
   receipt.js
   FoodExpress Receipt
========================================================== */

async function loadReceipt() {

    try {

        const response = await api.get("/orders");

        const orders =
            response.orders ||
            response.data?.orders ||
            [];

        if (!orders.length) {

            showEmptyReceipt();

            return;

        }
 const params = new URLSearchParams(window.location.search);

const orderId = params.get("id");

let order;

if (orderId) {

    order = orders.find(o => o._id === orderId);

} else {

    order = orders.sort(
        (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )[0];

}

if (!order) {

    showEmptyReceipt();

    return;

}

renderReceipt(order);
    }

    catch(error){

        console.log(error);

        alert("Unable to load receipt.");

    }

}

function renderReceipt(order){

    const user = getUser();

    document.getElementById("customerName").innerText =
        user?.name || "-";

    document.getElementById("receiptNumber").innerText =
        "FE-"+String(order._id).slice(-6).toUpperCase();

    document.getElementById("orderId").innerText =
        order._id;

    document.getElementById("paymentId").innerText =
        order.razorpayPaymentId || "-";

    document.getElementById("paymentMethod").innerText =
        order.paymentMethod;

    document.getElementById("paymentDate").innerText =
        order.paymentDate
        ?
        new Date(order.paymentDate).toLocaleString()
        :
        "-";

    document.getElementById("subtotal").innerText =
        formatCurrency(order.totalPrice-40);

    document.getElementById("grandTotal").innerText =
        formatCurrency(order.totalPrice);

    const container =
        document.getElementById("receiptItems");

    container.innerHTML="";

    (order.items||[]).forEach(item=>{

        const food =
            item.foodId ||
            item.food ||
            {};

        container.innerHTML+=`

<div class="d-flex justify-content-between border-bottom py-2">

<div>

<strong>

${food.name || item.name}

</strong>

<br>

Qty :

${item.quantity}

</div>

<div>

${formatCurrency(

(food.price || item.price || 0)

*

(item.quantity || 1)

)}

</div>

</div>

`;

    });

}

function showEmptyReceipt(){

document.querySelector(".card-body").innerHTML=`

<div class="text-center py-5">

<h3>

No Receipt Found

</h3>

<a

href="orders.html"

class="btn btn-success mt-3">

Back To Orders

</a>

</div>

`;

}

function formatCurrency(value){

return new Intl.NumberFormat(

"en-IN",

{

style:"currency",

currency:"INR",

minimumFractionDigits:0

}

).format(value||0);

}

document.addEventListener(

"DOMContentLoaded",

loadReceipt

);
