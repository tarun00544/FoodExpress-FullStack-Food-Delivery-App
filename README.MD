# 🍔 FoodExpress - Full Stack Food Delivery Application

A modern **Full Stack Food Delivery Web Application** built using the **MERN Stack**. FoodExpress allows users to browse delicious meals, manage carts, place orders, leave reviews, and securely make payments. It also includes a powerful Admin Dashboard to manage food items, users, and orders.

---

## 🚀 Live Demo

### 🌐 Frontend
https://food-express-full-stack-food-delive.vercel.app/

### ⚙️ Backend API
https://foodexpress-fullstack-food-delivery-app.onrender.com/

---
 
# ✨ Features

## 👤 User Features

- User Registration & Login
- JWT Authentication
- Browse Food Menu
- Search Food
- Category Filter
- Price Filter
- Sorting
- Add to Cart
- Update Cart Quantity
- Remove from Cart
- Wishlist
- Checkout
- Razorpay Payment
- Order History
- Track Orders
- Profile Management
- Change Password
- Review & Rating System

---

## 👨‍💼 Admin Features

- Secure Admin Login
- Dashboard Analytics
- Total Revenue
- Total Orders
- Total Users
- Total Foods
- Add Food
- Update Food
- Delete Food
- Manage Orders
- View Customers
- View Reviews

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- Bootstrap 5
- JavaScript (ES6)
- Fetch API

---

## Backend

- Node.js
- Express.js

---

## Database

- MongoDB Atlas
- Mongoose

---

## Authentication

- JWT Authentication
- Protected Routes
- Role-Based Authorization

---

## Payment Gateway

- Razorpay

---

## Deployment

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

# 📂 Project Structure

```
FoodExpress-FullStack-Food-Delivery-App
│
├── Backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── server.js
│   └── package.json
│
├── Frontend
│   ├── assets
│   ├── css
│   ├── js
│   ├── index.html
│   ├── menu.html
│   ├── cart.html
│   ├── wishlist.html
│   ├── orders.html
│   ├── profile.html
│   ├── admin.html
│   └── ...
│
└── README.md
```

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/tarun00544/FoodExpress-FullStack-Food-Delivery-App.git
```

```bash
cd FoodExpress-FullStack-Food-Delivery-App
```

---

# Backend Setup

```bash
cd Backend
```

Install dependencies

```bash
npm install
```

Create `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_key_id

RAZORPAY_KEY_SECRET=your_key_secret
```

Run Backend

```bash
npm start
```

or

```bash
npm run dev
```

---

# Frontend Setup

Open the **Frontend** folder.

Run using **VS Code Live Server** or any local server.

Example:

```
http://127.0.0.1:5500/Frontend/index.html
```

---

# 🔑 Environment Variables

```env
PORT=

MONGO_URI=

JWT_SECRET=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=
```

---

# 📡 API Endpoints

## Authentication

```
POST /api/auth/register

POST /api/auth/login

PUT /api/auth/profile

PUT /api/auth/password
```

---

## Foods

```
GET /api/foods

GET /api/foods/:id

POST /api/foods

PUT /api/foods/:id

DELETE /api/foods/:id
```

---

## Cart

```
GET /api/cart

POST /api/cart

PUT /api/cart/:id

DELETE /api/cart/:id
```

---

## Wishlist

```
GET /api/wishlist

POST /api/wishlist

DELETE /api/wishlist/:id
```

---

## Orders

```
GET /api/orders

POST /api/orders

PUT /api/orders/:id

DELETE /api/orders/:id
```

---

## Reviews

```
GET /api/reviews/:foodId

POST /api/reviews

PUT /api/reviews/:id

DELETE /api/reviews/:id
```

---

## Admin

```
GET /api/admin/dashboard

GET /api/admin/orders

GET /api/admin/users

POST /api/admin/foods

PUT /api/admin/foods/:id

DELETE /api/admin/foods/:id
```

---

# 💻 Screens Included

- Home
- Menu
- Food Details
- Search & Filters
- Wishlist
- Cart
- Checkout
- Razorpay Payment
- Orders
- Profile
- Reviews
- Admin Dashboard
- Admin Analytics
- User Management

---

# 🚀 Future Improvements

- Email Verification
- Forgot Password
- Google Authentication
- Coupon System
- Push Notifications
- Order Tracking Map
- Restaurant Panel
- Delivery Partner Panel
- Dark Mode
- PWA Support

---

# 👨‍💻 Author

**Tarun Kumar**

B.Tech CSE (Full Stack Development)

GitHub

https://github.com/tarun00544

LinkedIn

https://www.linkedin.com/in/tarun-kumar-ba7941296

Portfolio

https://tarun-portfolio-pi.vercel.app/

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

It motivates me to build more awesome projects.

---

# 📜 License

This project is licensed under the MIT License.

---

## ❤️ Thank You

Thank you for visiting the FoodExpress project.

Happy Coding! 🚀
