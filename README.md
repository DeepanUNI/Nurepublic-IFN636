# Digital Product Marketplace- Nu republic

A digital marketplace built to cover the gap in the market in which no other website has the ability to let individuals post their product to sell in a minimalist website, At this poin the Nu republic market place has one admin who can edit and delete products looking more like a convention marketplace but the website can also be converted into a markept place where anyone can put up their products to sell. This website Covers one complete workflow — signup/login, admin product
management, browse, purchase, and view library

## Architecture Summary
- **Backend**: Node.js + Express + Mongoose (MongoDB Atlas), JWT auth, role-based middleware (`admin` / `user`)
- **Frontend**: React (Vite) + React Router, JWT stored in localStorage
- **Database**: MongoDB Atlas (cloud-hosted, no local Mongo on the server)
- **Deployment**: Manual deployment to a single AWS EC2 Ubuntu instance (Nginx + PM2),

## Setup

### Backend
```bash
cd backend
cp .env.example .env   
npm install
npm run dev             # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```
Create `frontend/.env` with `VITE_API_URL=http://localhost:5000/api` for local dev,
or your EC2 public URL + `/api` once deployed.

## API Endpoints
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | none | Create account |
| POST | /api/auth/login | none | Log in, returns JWT |
| POST | /api/auth/logout | none | Client discards token |
| GET | /api/products | user/admin | List all products |
| GET | /api/products/:id | user/admin | Product detail |
| POST | /api/products | admin | Create product |
| PUT | /api/products/:id | admin | Update product |
| DELETE | /api/products/:id | admin | Delete product |
| POST | /api/orders/purchase | user/admin | Purchase a product |
| GET | /api/orders/my-library | user/admin | View own purchases |

## Known Limitations
- No real payment gateway — purchase creates an order record only.
- Single admin account model; no multi-vendor support.
- No password reset flow.
- MongoDB Atlas IP allowlist set broad (0.0.0.0/0) for the assignment window —
  would be restricted to the EC2 instance's static IP in a production setting.

## Deployment (manual)
1. Launch EC2 Ubuntu instance (t3.medium), open inbound SSH (22) + HTTP (80) +
   custom TCP for the app port to your IP as needed.
2. SSH in, install Node.js, PM2, Nginx.
3. Clone this repo, `cd backend && npm install`, create `.env` on the server
   (never commit it), start with `pm2 start server.js --name marketplace-api`.
4. `cd frontend && npm install && npm run build`, serve the `dist/` folder via
   Nginx, reverse-proxy `/api` to the PM2-managed backend port.
5. Verify: signup → login → add product (admin) → browse → purchase → library,
   all against the public EC2 URL.


