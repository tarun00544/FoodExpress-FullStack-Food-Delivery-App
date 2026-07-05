// FoodExpress checkout.js
// Checkout flow skeleton integrated with existing api.js

let currentStep=1;
let currentFood=null;
let quantity=1;
const isCartCheckout =
    new URLSearchParams(window.location.search).get("cart");
    document.addEventListener("DOMContentLoaded", async () => {

    bindButtons();

    await loadProduct();

    const savedAddress = JSON.parse(
        localStorage.getItem("checkoutAddress")
    );

    if (savedAddress) {

        renderAddress();

        gotoStep(2);

    } else {

        gotoStep(1);

    }

});
 async function loadProduct() {

    if (isCartCheckout) {

        currentFood = null;

        const cart =
            JSON.parse(localStorage.getItem("cartCheckout")) || [];

        renderCartSummary(cart);

        return;
    }
    
    const id =
        new URLSearchParams(location.search).get("id");

    if (!id) {

        location.href = "menu.html";
        return;

    }

    const res = await api.get(`/foods/${id}`);

    currentFood = res.food;

    renderSummary();
}
 function renderCartSummary(cart){

    if(!cart.length) return;

    let subtotal = 0;

    const container = document.getElementById("summaryItems");

    container.innerHTML = "";

    cart.forEach(item=>{

        const food = item.food || item.foodId;

        subtotal += food.price * item.quantity;

        container.innerHTML += `

        <div class="d-flex justify-content-between mb-2">

            <span>${food.name} × ${item.quantity}</span>

            <span>₹${food.price * item.quantity}</span>

        </div>

        `;

    });

    // ==========================
    // First item image
    // ==========================

    const firstFood = cart[0].food || cart[0].foodId;

    document.getElementById("summaryImage").src =
        firstFood.image;

    document.getElementById("summaryName").innerText =
        `${cart.length} Item(s)`;

    document.getElementById("summaryQty").innerText =
        cart.reduce((t,i)=>t+i.quantity,0);

    document.getElementById("summaryPrice").innerText =
        subtotal;

    document.getElementById("subtotal").innerText =
        "₹"+subtotal;

    document.getElementById("grandTotal").innerText =
        "₹"+(subtotal+60);

}

function bindButtons(){
  document.getElementById("toSummary")?.addEventListener("click",()=>{
    if(!validateAddress()) return;
    renderAddress();
    gotoStep(2);
  });
  
  document.getElementById("backAddress")?.addEventListener("click",()=>gotoStep(1));
  document.getElementById("toPayment")?.addEventListener("click",()=>gotoStep(3));
  document.getElementById("backSummary")?.addEventListener("click",()=>gotoStep(2));
  document.getElementById("placeOrder")?.addEventListener("click",placeOrder);
  document.getElementById("useAddress")
?.addEventListener("click",()=>{

    gotoStep(2);

});
}

function gotoStep(step){
 currentStep=step;
 [1,2,3].forEach(i=>{
   document.getElementById("step"+i)?.classList.add("d-none");
   document.getElementById("indicator"+i)?.classList.remove("active","completed");
 });
 document.getElementById("step"+step)?.classList.remove("d-none");
 for(let i=1;i<step;i++) document.getElementById("indicator"+i)?.classList.add("completed");
 document.getElementById("indicator"+step)?.classList.add("active");
}

function validateAddress(){
 const ids=["fullName","phone","email","address","city","state","pincode"];
 const data={};
 for(const id of ids){
   const v=document.getElementById(id).value.trim();
   if(!v){alert("Please fill all fields.");return false;}
   data[id]=v;
 }
 localStorage.setItem("checkoutAddress",JSON.stringify(data));
 return true;
}

 function renderAddress() {

    const d = JSON.parse(localStorage.getItem("checkoutAddress") || "null");

    if (!d) return;

    const html = `
        <b>${d.fullName}</b><br>
        ${d.address}<br>
        ${d.city}, ${d.state} - ${d.pincode}<br>
        ${d.phone}
    `;

    if (document.getElementById("deliveryAddress")) {
        document.getElementById("deliveryAddress").innerHTML = html;
    }

    if (document.getElementById("deliveryAddress2")) {
        document.getElementById("deliveryAddress2").innerHTML = html;
    }
}

function renderSummary(){
 if(!currentFood) return;
 document.getElementById("summaryImage").src=currentFood.image;
 document.getElementById("summaryName").textContent=currentFood.name;
 document.getElementById("summaryQty").textContent=quantity;
 document.getElementById("summaryPrice").textContent=currentFood.price;
 const subtotal=currentFood.price*quantity;
 document.getElementById("subtotal").textContent="₹"+subtotal;
 document.getElementById("grandTotal").textContent="₹"+(subtotal+60);
}
 async function placeOrder() {

    try {

        const addr = JSON.parse(
            localStorage.getItem("checkoutAddress")
        );

        const paymentMethod =
            document.querySelector(
                'input[name="payment"]:checked'
            ).value;

        // ===========================
        // Order Items
        // ===========================

        let items = [];
        let totalPrice = 0;

        if (isCartCheckout) {

            const cart =
                JSON.parse(localStorage.getItem("cartCheckout")) || [];

            items = cart.map(item => {

                const food = item.food || item.foodId;

                totalPrice += food.price * item.quantity;

                return {
                    foodId: food._id,
                    quantity: item.quantity
                };

            });

        } else {

            items = [{
                foodId: currentFood._id,
                quantity: quantity
            }];

            totalPrice = currentFood.price * quantity;

        }

        totalPrice += 60; // Delivery + GST

        // ===========================
        // Request Body
        // ===========================

        const body = {

            items,

            totalPrice,

            address: {
                fullName: addr.fullName,
                phone: addr.phone,
                email: addr.email,
                address: addr.address,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode
            },

            phone: addr.phone,

            paymentMethod

        };

        // ===========================
        // Cash On Delivery
        // ===========================

        if (paymentMethod === "Cash on Delivery") {

            await api.post("/orders", body);

            try {
                await api.delete("/cart/clear");
            } catch (e) {}

            
            localStorage.removeItem("cartCheckout");

            showAlert(
                "Order Placed Successfully",
                "success"
            );

            setTimeout(() => {

                window.location.href = "orders.html";

            }, 1200);

            return;

        }

        // ===========================
        // UPI / Card
        // ===========================

        payWithRazorpay(body);

    }

    catch (e) {

        showAlert(
            e.message,
            "danger"
        );

    }

}
document
.getElementById("changeAddress")
.addEventListener("click",()=>{
 
    gotoStep(1);

});