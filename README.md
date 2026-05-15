# 🏠 RentEase

> A modern, comprehensive Rental Property Management System designed to bridge the gap between property owners, tenants, and administrators. 

RentEase simplifies property listings, tenant applications, maintenance workflows, and overall communication through a seamless digital experience. Whether you're a property owner looking to manage your portfolio, a tenant searching for a new home, or an admin overseeing operations, RentEase provides the tools you need.

## ✨ Key Features

- **For Tenants:**
  - Search, filter, and view property listings seamlessly.
  - Interactive map integration for property locations.
  - Submit and track maintenance requests.
  - Secure payment processing and rent tracking.
  
- **For Property Owners:**
  - Comprehensive owner dashboard to manage properties.
  - Listing moderation and visibility controls.
  - Track assigned maintenance technicians and work orders.
  
- **For Administrators:**
  - Centralized admin dashboard for system oversight.
  - Manage bookings, users, and maintenance workflows (assignment, pause/resume).
  - Review and moderate property listings.

- **Platform-Wide:**
  - Real-time notifications and AI Chatbot assistance.
  - Secure JWT-based authentication.
  - Fully responsive design with Light/Dark theme support.

## 🛠 Tech Stack

### Frontend
- **Framework:** React.js powered by Vite
- **Styling:** Tailwind CSS
- **Testing:** Playwright (End-to-End Testing)
- **Core Concepts:** Context API for state management (Auth, Theme, Notifications)

### Backend
- **Framework:** Spring Boot (Java)
- **Database:** MongoDB
- **Build Tool:** Maven
- **Architecture:** Scalable RESTful API

## 📂 Project Structure

This repository is organized as a monorepo containing both the frontend and backend applications:

```text
RentEase/
├── backend/       # Spring Boot + MongoDB application
│   ├── src/       # Java source code (Controllers, Services, Models)
│   └── pom.xml    # Maven configurations and dependencies
└── frontend/      # React + Vite application
    ├── src/       # UI components, pages, contexts, and API services
    ├── e2e/       # Playwright end-to-end tests for critical flows
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **Java Development Kit (JDK)** 17 or higher
- **Maven**
- **MongoDB** (Local instance or Atlas cloud cluster)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd RentEase
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   # Ensure MongoDB is running and update application.properties if needed
   ./mvnw spring-boot:run
   ```
   *The Spring Boot server will typically run on `http://localhost:8080`.*

3. **Frontend Setup:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The React application will be available at `http://localhost:5173`.*

## 🧪 Testing

The application uses **Playwright** for extensive End-to-End (E2E) testing across crucial workflows (e.g., full lifecycle of maintenance requests, tenant interactions, owner visibility).

To run the E2E test suite:
```bash
cd frontend
npx playwright test
```

## 👥 Contributors

This is a collaborative group project developed to showcase advanced full-stack capabilities, modern UI/UX design, and robust backend management solutions.

---
*RentEase — Making rental property management efficient, transparent, and hassle-free.*
