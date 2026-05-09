

# 🗂️ Client Management System

A full-stack **Client Document & Relationship Management System** built with **React.js** (frontend) and **Spring Boot** (backend), backed by a **MySQL** database.
<br>
<img width="947" height="412" alt="Screenshot 2026-05-09 124322" src="https://github.com/user-attachments/assets/52c5939c-ad59-40af-bdab-7890dba29fbe" /><br>
<img width="955" height="415" alt="Screenshot 2026-05-09 124310" src="https://github.com/user-attachments/assets/3ca0625c-2f8b-4a02-9db3-d8b77871467f" />

---

## ✨ Features

- 📊 **Dashboard** — Overview of clients, documents, and activity stats
- 👥 **Client Management** — Add, view, search, and manage client profiles
- 🌳 **Family Tree** — Interactive SVG-based visualization of client family relationships
- 📄 **Document Tracker** — Upload and track client documents
- 📍 **Location Management** — Master list of locations linked to clients

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React 19, React Router v7, Axios     |
| UI Library | Bootstrap 5, Lucide Icons, react-d3-tree |
| Backend    | Spring Boot 4, Spring Data JPA       |
| Language   | Java 17                              |
| Database   | MySQL 8                              |
| Build Tool | Maven (via Maven Wrapper)            |

---

## 📁 Project Structure

```
client_managment_system/
├── frontend/          ← React application
│   ├── src/
│   │   ├── pages/     ← Dashboard, ClientList, FamilyTree, etc.
│   │   ├── components/← Navbar, Layout, reusable UI components
│   │   └── index.css  ← Global styles
│   └── package.json
│
└── backend/           ← Spring Boot REST API
    ├── src/
    │   └── main/
    │       ├── java/com/cms/   ← Controllers, Services, Repositories, Models
    │       └── resources/
    │           └── application.properties
    └── pom.xml
```

---

## ⚙️ Prerequisites

Make sure you have the following installed before setting up the project:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | https://nodejs.org |
| **npm** | Comes with Node.js | — |
| **Java JDK** | 17 or higher | https://adoptium.net |
| **MySQL** | 8.0 or higher | https://dev.mysql.com/downloads |
| **Maven** | Not required (Maven Wrapper included) | — |
| **Git** | Latest | https://git-scm.com |

---

## 🚀 Getting Started (Clone & Run)

### Step 1 — Clone the Repository into your system

```bash
git clone https://github.com/chipkarsaish/client_managment_system.git
cd client_managment_system
```

---

### Step 2 — Set Up the Database (MySQL)

1. Open **MySQL Workbench** or any MySQL client (like DBeaver, HeidiSQL, or MySQL CLI).

2. Create a new database:
   ```sql
   CREATE DATABASE client_management;
   ```

3. That's it! The tables will be **auto-created** by Spring Boot (Hibernate) when you first run the backend.

---

### Step 3 — Configure the Backend

Open the file:
```
backend/src/main/resources/application.properties
```

Update your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/client_management
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

> **Default values in the project are:**
> - Username: `root`
> - Password: `mysql80`
>
> Change them to match your own MySQL setup.

---

### Step 4 — Run the Backend (Spring Boot)

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
```

**On Windows:**
```bash
mvnw.cmd spring-boot:run
```

**On Mac/Linux:**
```bash
./mvnw spring-boot:run
```

✅ The backend will start at: **`http://localhost:8080`**

> **Note:** The first run may take a few minutes as Maven downloads all dependencies.

---

### Step 5 — Run the Frontend (React)

Open a **new terminal** (keep the backend running) and navigate to the `frontend` folder:

```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the React development server:
```bash
npm start
```

✅ The frontend will open automatically at: **`http://localhost:3000`**

---

## 🔗 API Base URL

The React frontend communicates with the backend at:
```
http://localhost:8080/api
```

If you change the backend port, update the API base URL in the frontend source files accordingly.

---

## 📦 Key npm Packages Used

| Package | Purpose |
|---------|---------|
| `react-router-dom` | Page routing & navigation |
| `axios` | HTTP requests to backend API |
| `bootstrap` | UI styling & grid system |
| `lucide-react` | Icons |
| `react-d3-tree` | Interactive Family Tree visualization |

---



## 👨‍💻 Author

> Built with ❤️ — Feel free to reach out for questions or contributions!
