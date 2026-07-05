 /* ==========================================================
   payment.js
   FoodExpress Payment
========================================================== */

async function payWithRazorpay(orderData) {

    try {

        showAlert(
            "Creating Payment...",
            "info"
        );

        const response = await api.post(
            "/payment/create-order",
            {
                amount: orderData.totalPrice
            }
        );

         


const data = response.data || response;
if(!data.success){

      

            throw new Error(
                data.message ||
                "Unable to create payment."
            );

        }

        openRazorpay(
            data,
            orderData
        );

    }

    catch (error) {

        console.error(error);

        showAlert(
            error.message,
            "danger"
        );

    }

}

function openRazorpay(response, orderData) {

    const user = getUser();

    const options = {

         key:

response.key ||

response.data?.key,

amount:

response.order?.amount ||

response.data?.order?.amount,

currency:

response.order?.currency ||

response.data?.order?.currency,

order_id:

response.order?.id ||

response.data?.order?.id,

        name: "FoodExpress",

        description: "Food Order",

        image: "images/logo.png",

         

        prefill: {

            name: user?.name || "",

            email: user?.email || "",

            contact: orderData.phone

        },

        theme: {

            color: "#ff6b35"

        },

                config: {

            display: {

                blocks: {

                    cards: {

                        name: "Cards",

                        instruments: [

                            {

                                method: "card"

                            }

                        ]

                    },

                    upi: {

                        name: "UPI",

                        instruments: [

                            {

                                method: "upi"

                            }

                        ]

                    },

                    wallets: {

                        name: "Wallet",

                        instruments: [

                            {

                                method: "wallet"

                            }

                        ]

                    },

                    netbanking: {

                        name: "Net Banking",

                        instruments: [

                            {

                                method: "netbanking"

                            }

                        ]

                    }

                },

                sequence: [

                    "cards",

                    "upi",

                    "wallets",

                    "netbanking"

                ],

                preferences: {

                    show_default_blocks: true

                }

            }

        },

                retry: {

            enabled: true,

            max_count: 3

        },
                handler: function(paymentResponse) {

            verifyPayment(

                paymentResponse,

                orderData

            );

        },
                modal: {

            ondismiss() {

                showAlert(

                    "Payment Cancelled",

                    "warning"

                );

                paymentFailed(

            "Payment Cancelled"

        );

        

            }

            

        }

        

    };

    const razorpay =

        new Razorpay(options);

    razorpay.open();

}

// ==========================================================
// Verify Payment
// ==========================================================

async function verifyPayment(paymentResponse, orderData) {

    try {

        showAlert(
            "Verifying Payment...",
            "info"
        );

        const response = await api.post(
            "/payment/verify-payment",
            {

                razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                razorpay_signature:
                    paymentResponse.razorpay_signature,

                orderData

            }
        );

        const success =
            response.success ||
            response.data?.success;

        if (!success) {

            throw new Error(
                response.message ||
                response.data?.message ||
                "Payment Verification Failed"
            );

        }

        paymentSuccess(
            response,
            orderData
        );

        savePaymentReceipt(
    orderData,
    paymentResponse
);

    }

    catch (error) {

        console.error(error);

        paymentFailed(
            error.message
        );

    }

}

  



// ==========================================================
// Payment Success
// ==========================================================

async function paymentSuccess(response, orderData) {

    try {

        refreshCartBadge();

        showAlert(
            "Payment Successful 🎉",
            "success"
        );

        // Store latest order locally (optional)
        if (response.order) {

            localStorage.setItem(
                "lastOrder",
                JSON.stringify(response.order)
            );

        }

        // Store payment details
        localStorage.setItem(
            "lastPayment",
            JSON.stringify({

                paymentId:
                    response.order?.razorpayPaymentId ||

                    response.order?.paymentId ||

                    "",

                paymentMethod:
                    orderData.paymentMethod,

                amount:
                    orderData.totalPrice

            })

        );

        setTimeout(() => {

            window.location.href =

                "orders.html";

        }, 1200);

    }

    catch (error) {

        console.log(error);

    }

}

// ==========================================================
// Payment Failed
// ==========================================================

function paymentFailed(message) {

    showAlert(

        message ||

        "Payment Failed",

        "danger"

    );

}

// ==========================================================
// Is Payment Successful
// ==========================================================

function isPaymentSuccessful(response) {

    return (

        response.success ||

        response.data?.success ||

        false

    );

}

window.addEventListener("focus",()=>{

    refreshCartBadge();

});

// ==========================================================
// Save Payment Receipt
// ==========================================================

function savePaymentReceipt(orderData, paymentResponse) {
       const address = JSON.parse(
        localStorage.getItem("checkoutAddress")
    );
    
    const receipt = {

        orderId:
            paymentResponse.razorpay_order_id,

        paymentId:
            paymentResponse.razorpay_payment_id,

        amount:
            orderData.totalPrice,

        paymentMethod:
            orderData.paymentMethod,

        address: address,
           
        phone:
            orderData.phone,

        date:
            new Date().toLocaleString()

    };

    localStorage.setItem(

        "paymentReceipt",

        JSON.stringify(receipt)

    );

}

window.addEventListener(

    "focus",

    ()=>{

        refreshCartBadge();

    }

);

function getPaymentDate(){

    return new Date().toLocaleString();

}

function getPaymentMode(orderData){

    return orderData.paymentMethod;

}

console.log(

    "FoodExpress Payment Ready"

);