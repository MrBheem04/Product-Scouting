# ScoutPrice 🚀 — AI-Powered Price Tracker & Shopping Assistant

ScoutPrice is a complete, production-ready, feature-rich, and visually stunning AI-powered price-tracking, coupon-finder, and shopping assistant platform similar to BuyHatke.com and Honey. 

Designed for Indian e-commerce portals (**Amazon, Flipkart, Myntra, Ajio, Meesho**), it integrates a real-time web scraper, price tracking analytics, alert triggers, auto-coupon solvers, and an AI chatbot assistant into a cohesive microservices architecture.

---

## 🏗️ Architecture & Tech Stack

```
                               ┌────────────────────────┐
                               │   Chrome Extension     │
                               │  (Manifest V3 Inject)  │
                               └───────────┬────────────┘
                                           │ API Requests
                                           ▼
┌──────────────────┐           ┌────────────────────────┐           ┌──────────────────┐
│   Vite Frontend  ├──────────►│      Nginx Proxy       ├──────────►│  Express Backend │
│  (React/Tailwind)│           │       (Port 80)        │           │   (Port 5000)    │
└──────────────────┘           └────────────────────────┘           └────────┬─────────┘
                                                                             │
                                              ┌──────────────────────────────┼──────────────────────────────┐
                                              │                              │                              │
                                              ▼                              ▼                              ▼
                                    ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
                                    │     MongoDB      │           │  Redis (BullMQ)  │           │   OpenAI API /   │
                                    │   (Port 27017)   │           │   (Port 6379)    │           │ Expert Rules Engine│
                                    └──────────────────┘           └──────────────────┘           └──────────────────┘
```

### Backend (Node.js + Express)
- **Database**: MongoDB (Mongoose schemas) with composite price history indexes and full-text search indexing.
- **Queuing & Real-time**: Redis + BullMQ for asynchronous scraper tasks, WebSockets (Socket.io) for live alerts.
- **Scraping Engine**: Puppeteer + Cheerio dual-mode crawler with automatic high-fidelity synthetic mock backup.
- **Services**: Nodemailer (SMTP mock backup), OpenAI API client with expert rule-based fallback.

### Frontend (React.js + Redux Toolkit + Vite)
- **Theme**: Premium futuristic Dark Glassmorphism, utilizing modern neon purple-to-indigo and blue HSL color systems.
- **State Management**: Redux Toolkit for global synchronized caching of authentication, products, watchlists, alerts, coupons, and chats.
- **Charts**: Recharts custom Area curves showcasing lowest, highest, average tags and "best time to buy" analytics.

### Chrome Extension (Manifest V3)
- Injects a floating overlay helper onto active Amazon and Flipkart product pages.
- Visual micro-animations including code auto-typing verification and real-time comparison tables.

---

## ⚡ Quick Start: Docker Compose (Recommended)

To run the entire system, database, redis, and Nginx proxy in a single command, ensure you have **Docker** and **Docker Compose** installed, then:

1. Clone or navigate to the workspace directory:
   ```bash
   cd "c:\Users\LENOVO\OneDrive\Desktop\Product Scouting"
   ```

2. Create a `.env` file in the root or set the variables inside `docker-compose.yml`:
   ```env
   OPENAI_API_KEY=your-optional-openai-key
   SMTP_HOST=smtp.ethereal.email
   ```

3. Launch the environment:
   ```bash
   docker compose up --build -d
   ```

4. Seed the database (populates catalog, users, coupons, alerts, and 30-day price trend history):
   ```bash
   docker exec -it scoutprice_backend npm run seed
   ```

5. Access the platforms:
   - **Frontend App**: [http://localhost](http://localhost) (Proxied via Nginx)
   - **Backend API Docs / Health**: [http://localhost/health](http://localhost/health)
   - **Local DB Admin Port**: `mongodb://scoutprice:scoutprice_secret@localhost:27017/scoutprice?authSource=admin`

---

## 🛠️ Local Development (Manual Setup)

If you prefer to run services manually for debugging:

### Prerequisites
- Node.js 18+ installed.
- Local MongoDB running at `mongodb://127.0.0.1:27017/scoutprice`.
- Local Redis running at `127.0.0.1:6379`.

### 1. Setup Backend
```bash
cd backend
npm install
# Create .env based on .env.example
npm run seed
npm run dev
```
*Backend server runs on [http://localhost:5000](http://localhost:5000).*

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Vite dev server runs on [http://localhost:5173](http://localhost:5173).*

### 3. Load Chrome Extension
1. Open Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer mode** (top-right).
3. Click **Load unpacked** and select the `/extension` directory inside the project root.
4. Open any Amazon.in or Flipkart.com product page to view the injected floating widget.

---

## 🧪 API Verification & Testing

We provide a testing script to verify all major REST APIs (Register, Login, watchlist management, scraper triggers, coupon validation, compare matrix, AI recommendations):

To run the PowerShell API validator:
```powershell
powershell -ExecutionPolicy Bypass -File ./scratch/api_test.ps1
```

### Primary Endpoints
| Action | Method | URL | Authentication |
| :--- | :--- | :--- | :--- |
| Health Check | `GET` | `/health` | None |
| Register | `POST` | `/api/users/register` | None |
| Login | `POST` | `/api/users/login` | None |
| Search Catalog | `GET` | `/api/products?search=Query` | None |
| Live Scrape / Add | `POST` | `/api/products/search` | None |
| Product Details | `GET` | `/api/products/:id` | None |
| Price History | `GET` | `/api/products/:id/history` | None |
| Watchlist | `GET` | `/api/users/watchlist` | JWT Token |
| Create Alert | `POST` | `/api/alerts` | JWT Token |
| List Coupons | `GET` | `/api/coupons` | None |
| Cross Compare | `POST` | `/api/products/compare` | None |
| AI Chatbot | `POST` | `/api/ai/chat` | None |

---

## 🛡️ Security Features
- **Helmet.js** sets HTTP headers to protect against clickjacking, script injection, and MIME sniffing.
- **Express Rate Limiting** restricts IPs to a maximum of 100 requests per 15 minutes globally, with specialized strict rules for product searches.
- **CORS Configuration** allows credentialed access with customizable domain white-lists.
- **JWT Authorization** guards saved watchlist, push configurations, and price-drop triggers.

---

Designed with 💜 by Antigravity.
