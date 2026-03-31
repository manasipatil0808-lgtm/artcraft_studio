# 🎨 ArtCraft Studio

A full-stack e-commerce platform for buying and selling handcrafted products.
Built with modern web technologies, ArtCraft Studio connects artists (sellers) with customers.

---

## 🚀 Features

### 👤 Authentication

* User registration & login
* Role-based access (Customer / Seller / Admin)
* JWT authentication

### 🛍️ Products

* Browse products
* Categories support
* Product details view
* Add / Update / Delete products (Seller/Admin)

### 🛒 Cart

* Add to cart
* Update quantity
* Remove items
* Persistent cart for logged-in users

### 📦 Orders

* Place orders
* Order history
* Order status tracking

### 💳 Payments

* Razorpay integration (Test Mode)
* Payment verification

### ⭐ Reviews

* Add product reviews
* View ratings & feedback

### 📧 Email

* Order confirmation emails via SMTP

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express.js
* Sequelize ORM

### Database

* MySQL

### Other Tools

* Razorpay (Payments)
* Supabase (Storage)
* Nodemon
* Concurrently

---

## 📂 Project Structure

```
artcraft_studio/
│
├── frontend/        # React frontend
├── backend/         # Node.js backend
├── .env             # Environment variables
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/manasipatil0808-lgtm/art_craft_studio.git
cd art_craft_studio
```

---

### 2️⃣ Install Dependencies

```
npm install
cd frontend && npm install
cd ../backend && npm install
```

---

### 3️⃣ Setup Environment Variables

Create `.env` file in **backend**:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=artcraft_studio
DB_PORT=3306

JWT_SECRET=your_secret
```

---

### 4️⃣ Run Project

```
npm run dev
```

---

### 5️⃣ Open in Browser

```
Frontend: http://localhost:5174
Backend: http://localhost:5000
```

---

## 🧪 Demo Credentials (Optional)

```
Admin:
email: admin@artcraft.com
password: password123

User:
email: user@example.com
password: password123
```

---

## 📸 Screenshots

*Add screenshots of your UI here*

---

## 📌 Future Improvements

* Wishlist feature ❤️
* Advanced search & filters 🔍
* Admin dashboard 📊
* Image upload optimization 📷

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Manasi Patil**
GitHub: https://github.com/manasipatil0808-lgtm

---

## ⭐ Support

If you like this project, please ⭐ the repository!
