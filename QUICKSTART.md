# E-Commerce Platform - Quick Start Guide

## 🚀 Project Overview

Full-stack e-commerce application with:
- **Backend**: NestJS + PostgreSQL + JWT Authentication
- **Frontend**: React (JavaScript) + Vite

## 📂 Project Structure

```
ecom471/
├── backend/          # NestJS API (Port 3000)
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── stores/   # Store management
│   │   └── products/ # Product management
│   └── .env          # Database & JWT config
└── frontend/         # React App (Port 5173)
    ├── src/
    │   ├── api/      # API integration
    │   ├── context/  # Auth context
    │   ├── pages/    # Page components
    │   └── components/ # Reusable components
    └── package.json
```

## 🏃 Quick Start

### 1. Start Backend (Terminal 1)
```bash
cd D:\Code\ecom471\backend
npm run start:dev
```
Backend runs on: **http://localhost:3000**

### 2. Start Frontend (Terminal 2)
```bash
cd D:\Code\ecom471\frontend
npm run dev
```
Frontend runs on: **http://localhost:5173**

## 📋 Available APIs

### Authentication (Public)
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get profile (protected)

### Users (Protected)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Stores (Protected, Vendor for CUD)
- `GET /stores` - Get all stores
- `GET /stores/my-stores` - Get my stores
- `POST /stores` - Create store (Vendor only)
- `PATCH /stores/:id` - Update store (Vendor only)
- `DELETE /stores/:id` - Delete store (Vendor only)

### Products (Protected, Vendor for CUD)
- `GET /products` - Get all products
- `GET /products/my-products` - Get my products (Vendor only)
- `POST /products` - Create product (Vendor only)
- `PATCH /products/:id` - Update product (Vendor only)
- `DELETE /products/:id` - Delete product (Vendor only)

## 👤 User Roles

### Customer (Default)
- Browse products and stores
- View details

### Vendor
- All customer features
- Create/manage stores
- Add/manage products

### Superuser
- Content moderation (future)

## 🔐 Authentication Flow

1. **Register**: `POST /auth/register` with user data
2. **Receive**: JWT token + user object
3. **Store**: Token saved in localStorage
4. **Use**: Token sent automatically in `Authorization: Bearer <token>` header
5. **Access**: Protected routes now accessible

## 📱 Frontend Pages

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Login | `/login` | Public | User login |
| Register | `/register` | Public | User registration |
| Dashboard | `/dashboard` | Protected | User home |
| Products | `/products` | Protected | Browse all products |
| Stores | `/stores` | Protected | Browse all stores |
| My Stores | `/my-stores` | Vendor | Manage stores |
| My Products | `/my-products` | Vendor | Manage products |

## 🧪 Testing Workflow

### As Vendor:

1. **Register as Vendor**:
   ```
   Email: vendor@test.com
   Password: password123
   Role: vendor
   ```

2. **Create Store**:
   - Go to "My Stores"
   - Click "Create Store"
   - Fill details and submit

3. **Add Product**:
   - Go to "My Products"
   - Click "Add Product"
   - Select your store
   - Fill product details and submit

4. **Browse as Customer**:
   - Other users can see your products
   - In "Products" and "Stores" pages

### As Customer:

1. **Register as Customer**:
   ```
   Email: customer@test.com
   Password: password123
   Role: customer (default)
   ```

2. **Browse**:
   - View **Products** page
   - View **Stores** page
   - See products from all vendors

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3000
DB_HOST=segfaultdev.postgres.database.azure.com
DB_PORT=5432
DB_USERNAME=segfaultdev
DB_PASSWORD=Whoami30
DB_DATABASE=project471
DB_SSL=true
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Frontend (api.js)
```javascript
baseURL: 'http://localhost:3000'
```

## 🐛 Common Issues

### Issue: 401 Unauthorized
**Solution**: Generate fresh token by logging in again after server restart

### Issue: ownerId is null
**Solution**: Fixed - ensure using `req.user.id` not `req.user.userId`

### Issue: CORS error
**Solution**: Enable CORS in backend (should be enabled by default in NestJS)

### Issue: Frontend can't connect to backend
**Solution**: Ensure backend is running on port 3000

## 🎯 Key Features

✅ JWT Authentication with role-based access
✅ Vendor store management
✅ Product inventory management
✅ Browse products by category
✅ Store ownership validation
✅ Protected routes
✅ Responsive design
✅ Form validation
✅ Error handling

## 📚 Tech Stack

### Backend
- NestJS 11
- PostgreSQL (Azure)
- TypeORM
- Passport JWT
- Bcrypt
- Class Validator

### Frontend
- React 19
- React Router DOM
- Axios
- Vite
- CSS3

## 🎨 Design

- Purple/Blue gradient theme
- Card-based layouts
- Modern, clean UI
- Mobile responsive
- Smooth transitions

---

**Status**: ✅ Frontend and Backend fully functional and integrated!
**Next Steps**: Create stores, add products, test the full workflow!
