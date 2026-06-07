# Tenantly - Residential Property Management System 🏢

Tenantly is a modern, premium full-stack Residential Property Management platform designed to streamline interactions between **Tenants**, **Landlords**, and **Admins**. From flat allocation to rent agreement management, payments tracking, and official document verification, Tenantly makes property management seamless.

> [!NOTE]
> 🚧 **Project Status: Under Active Development**
> This project is currently in early development. New features, architectural updates, and UI enhancements are happening frequently. We welcome all feedback, recommended changes, feature proposals, and community collaborations!

---

## 🚀 Key Features & Flow Model

### 1. Unified Authentication & Admin Roles
- Secure, role-based authorization using JWT and password hashing via bcrypt.
- **Three user personas**:
  - **Admin**: Has ultimate control over the flat directory database, user verification, and final lease approvals.
  - **Landlord**: Manages owned properties, views financials, tracks tenant directories, and approves rent transactions.
  - **Tenant**: Accesses personal dashboard, makes monthly rental payments via screenshot uploads, and uploads legal documents.

### 2. Admin Seeding & Landlord Claims Flow
- Admin seeds the core properties (flats) database (e.g., Block A, Block B units).
- Landlords claim existing vacant, unassigned properties.
- Property claims are routed to the Admin dashboard for approval. Once verified, the property is linked to the landlord.

### 3. Tenant Rental Flow & Dual Approval
- Tenants can browse vacant, landlord-claimed properties and click **"Rent a Property"**.
- Rental requests are routed simultaneously to the respective **Landlord** and **Admin** for approval.
- Upon dual approval, a formal `Lease` is auto-spawned, shifting the property status to `"occupied"` and initiating tenant document uploads.

### 4. Automated Document Vault & Verification
- Landlords and tenants submit key documents (ID proof, rent agreements, ownership proof, etc.).
- Admin reviews and marks documents as `"Verified by Admin"`, displaying verification badges natively across user dashboards.

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Lucide icons, Context API |
| **Backend** | Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Multer |
| **Tooling** | Git, npm, TypeScript Compiler |

---

## 📦 Getting Started

### 📂 Directory Structure
- `frontend/`: React + Vite application
- `backend/`: Node + Express + TypeScript API

### 🔧 Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshGupta090722/SocietyOne.git
   cd SocietyOne
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `backend/` with the following:
   ```env
   MONGO_URL=your_mongodb_connection_string
   PORT=4000
   LANDLORD_SECRET_KEY=your_jwt_secret_key
   TENANT_SECRET_KEY=your_jwt_secret_key
   ADMIN_SECRET_KEY=your_jwt_secret_key
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the Vite frontend development server:
   ```bash
   npm run dev
   ```

---

## ☁️ Deployment Architecture (CI/CD)

SocietyOne uses a fully automated CI/CD pipeline using **GitHub Actions**, deploying to **AWS EC2** and **Vercel**.

### Backend (AWS EC2 + Docker)
- **Containerized:** The Node.js backend is compiled and packaged into a lean Docker image using a multi-stage `Dockerfile`.
- **Hosting:** Hosted on an AWS EC2 `t2.micro` Ubuntu instance.
- **Reverse Proxy & SSL:** Nginx is configured as a reverse proxy, securing the backend with a Let's Encrypt SSL certificate (via DuckDNS).
- **CI/CD Pipeline (`backend-aws.yml`):** Every push to the `main` branch affecting the `backend/` directory triggers a GitHub Action that:
  1. Checks TypeScript compilation.
  2. SSHs into the EC2 instance.
  3. Pulls the latest code, builds a new Docker image, and automatically restarts the container with zero downtime.

### Frontend (Vercel)
- **Hosting:** The React frontend is deployed globally via Vercel's Edge Network.
- **Environment:** The frontend communicates with the secure backend via the `VITE_API_URL` environment variable.
- **CI/CD Pipeline (`frontend-vercel.yml`):** Every push to the `main` branch affecting the `frontend/` directory triggers an automatic production build and deployment to Vercel. Pull requests generate preview environments automatically.

---

## 🤝 Contributing & Collaborations

We are completely open to collaborations! If you would like to contribute:
1. **Fork** the repository.
2. Create a new feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a **Pull Request**.

If you have architectural suggestions or recommended changes regarding state management, verification logic, or database design, please open an issue or reach out directly!
