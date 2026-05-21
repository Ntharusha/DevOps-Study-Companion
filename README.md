<div align="center">

# 🚀 DevOps Study Companion

**A full-stack, multi-platform productivity and learning system built for DevOps engineers — and a live showcase of modern DevOps engineering practices.**

[![Frontend CI](https://img.shields.io/github/actions/workflow/status/your-username/devops-study-companion/frontend_ci.yml?label=Frontend%20CI&logo=github-actions&style=flat-square)](/)
[![Backend CI](https://img.shields.io/github/actions/workflow/status/your-username/devops-study-companion/backend_ci.yml?label=Backend%20CI&logo=github-actions&style=flat-square)](/)
[![Android Build](https://img.shields.io/github/actions/workflow/status/your-username/devops-study-companion/android_build.yml?label=Android%20APK&logo=android&style=flat-square)](/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&style=flat-square)](/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-00ED64?logo=mongodb&style=flat-square)](/)
[![AWS EC2](https://img.shields.io/badge/Cloud-AWS%20EC2-FF9900?logo=amazon-aws&style=flat-square)](/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture Diagram](#️-architecture-diagram)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [DevOps Practices](#-devops-practices)
  - [CI/CD Pipelines](#-cicd-pipelines)
  - [Infrastructure as Code](#️-infrastructure-as-code-terraform)
- [Data Models](#-data-models)
- [API Reference](#-api-reference)
- [Application Features](#-application-features)
  - [Core Tracker](#-core-devops-tracker)
  - [Focus Timer](#️-focus-timer)
  - [Habits Tracker](#-habits-tracker)
  - [Study Goals](#-study-goals)
  - [Study Plant](#-study-plant)
- [Getting Started Locally](#-getting-started-locally)
- [Infrastructure Deployment](#-infrastructure-deployment-terraform)
- [Environment Variables](#-environment-variables)
- [License](#-license)

---

## 🧠 Overview

**DevOps Study Companion** is a comprehensive productivity platform designed specifically for DevOps learners. It lets you log study sessions, track labs and projects, build a command reference library, manage weekly goals, and maintain daily habits — all from a unified web dashboard or native Android app.

Beyond its features as an application, this repository serves as a **portfolio-grade demonstration of the full software delivery lifecycle**, combining:

- A **multi-tier monorepo** (Frontend · Backend · Mobile)
- **Three independent GitHub Actions pipelines** (Frontend CI, Backend CI, Android APK)
- **Terraform IaC** provisioning a production environment on AWS + MongoDB Atlas from zero

---

## 🏗️ Architecture Diagram

```mermaid
graph TB
    subgraph Client["👤 Client Layer"]
        WEB["🌐 React Web App<br/>(Vite + React 18)"]
        MOB["📱 Android App<br/>(React Native + Expo)"]
    end

    subgraph Backend["⚙️ Backend Layer"]
        API["🔌 Express REST API<br/>Node.js · Port 5000"]
        AUTH["🔐 Auth Route"]
        ROUTES["📡 Feature Routes<br/>entries · labs · habits<br/>goals · timer · commands<br/>errors · projects · memory<br/>interview · reports"]
    end

    subgraph Database["🗄️ Data Layer"]
        DB["🍃 MongoDB Atlas<br/>M0 Free Tier Cluster"]
    end

    subgraph Cloud["☁️ AWS Cloud (us-east-1)"]
        EC2["🖥️ EC2 t3.micro<br/>Ubuntu 22.04 + PM2"]
        SG["🛡️ Security Group<br/>Port 22 · Port 5000"]
    end

    subgraph CI["🔄 GitHub Actions"]
        FCI["Frontend CI<br/>Install → Build → Artifact"]
        BCI["Backend CI<br/>Install → Verify"]
        ACI["Android Build<br/>Prebuild → Gradle → APK"]
    end

    subgraph IaC["🏗️ Terraform (infrastructure/)"]
        TF["main.tf · variables.tf · outputs.tf"]
    end

    WEB -->|"HTTP/Axios"| API
    MOB -->|"HTTP/REST"| API
    API --> AUTH
    API --> ROUTES
    ROUTES --> DB
    EC2 --> API
    SG --> EC2
    IaC -->|"Provisions"| EC2
    IaC -->|"Provisions"| DB
    CI -->|"Triggers on push"| WEB
    CI -->|"Triggers on push"| API
    CI -->|"Triggers on push"| MOB
```

---

## 💻 Tech Stack

### Application Layer

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 18.3 |
| **Frontend Build** | Vite | 5.4 |
| **Frontend Charts** | Recharts | 2.12 |
| **Frontend Routing** | React Router DOM | 6.26 |
| **Backend Runtime** | Node.js | ≥ 20 |
| **Backend Framework** | Express | 4.21 |
| **Backend ORM** | Mongoose | 8.7 |
| **Mobile Framework** | React Native | 0.81 |
| **Mobile SDK** | Expo | 54 |
| **Mobile Storage** | MMKV (C++ native) | — |
| **Database** | MongoDB Atlas | M0 |

### DevOps & Cloud Layer

| Tool | Purpose |
|---|---|
| **GitHub Actions** | CI/CD automation |
| **Terraform** | Infrastructure as Code |
| **AWS EC2** | Backend server hosting |
| **AWS Security Groups** | Network access control |
| **MongoDB Atlas** | Managed database |
| **PM2** | Node.js process manager |

---

## 📁 Repository Structure

```
DevOps-Study-Companion/
├── .github/
│   └── workflows/
│       ├── frontend_ci.yml      # React build & artifact upload
│       ├── backend_ci.yml       # Node.js environment validation
│       └── android_build.yml    # Expo prebuild + Gradle APK
│
├── backend/
│   ├── models/                  # Mongoose data schemas
│   │   ├── Command.js
│   │   ├── Entry.js
│   │   ├── ErrorLog.js
│   │   ├── Goal.js
│   │   ├── Habit.js
│   │   ├── Lab.js
│   │   ├── Memory.js
│   │   ├── Project.js
│   │   ├── Question.js
│   │   └── TimerSession.js
│   ├── routes/                  # Express route handlers
│   │   ├── auth.js
│   │   ├── commands.js
│   │   ├── entries.js
│   │   ├── errors.js
│   │   ├── goals.js
│   │   ├── habits.js
│   │   ├── interview.js
│   │   ├── labs.js
│   │   ├── memory.js
│   │   ├── projects.js
│   │   ├── reports.js
│   │   └── timer.js
│   ├── server.js                # App entry point + MongoDB connect
│   ├── seed.js                  # Database seed script
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── pages/               # One component per route
│       │   ├── Dashboard.jsx
│       │   ├── FocusTimer.jsx
│       │   ├── Habits.jsx
│       │   ├── Goals.jsx
│       │   ├── StudyPlant.jsx
│       │   ├── Labs.jsx / LabDetail.jsx
│       │   ├── Commands.jsx
│       │   ├── Errors.jsx
│       │   ├── Projects.jsx
│       │   ├── MemoryBank.jsx
│       │   ├── Reports.jsx
│       │   ├── InterviewHelper.jsx
│       │   ├── Entries.jsx / NewEntry.jsx / EditEntry.jsx
│       │   └── Login.jsx
│       ├── components/
│       │   └── Sidebar.jsx
│       ├── App.jsx              # Router + auth guard
│       └── api.js               # Axios instance + helpers
│
├── mobile/                      # React Native / Expo app
│
└── infrastructure/
    ├── main.tf                  # EC2 + Security Group + Atlas cluster
    ├── variables.tf             # Input variable definitions
    └── outputs.tf               # EC2 IP + MongoDB connection string
```

---

## ⚙️ DevOps Practices

### 🔄 CI/CD Pipelines

Three independent workflows trigger automatically based on **path filters**, so changing the backend never runs the mobile build and vice versa.

```mermaid
flowchart LR
    PUSH["git push → main"]

    PUSH -->|"paths: frontend/**"| FCI
    PUSH -->|"paths: backend/**"| BCI
    PUSH -->|"paths: mobile/**"| ACI

    subgraph FCI["Frontend CI"]
        F1["Checkout"] --> F2["Setup Node 20"] --> F3["npm install"] --> F4["npm run build"] --> F5["Upload dist/ artifact"]
    end

    subgraph BCI["Backend CI"]
        B1["Checkout"] --> B2["Setup Node 20"] --> B3["npm install"] --> B4["Verify Environment"]
    end

    subgraph ACI["Android Build"]
        A1["Checkout"] --> A2["Setup Node 20 + Java 17"] --> A3["Setup Android SDK"] --> A4["npm install"] --> A5["expo prebuild --platform android"] --> A6["./gradlew assembleRelease"] --> A7["Upload APK artifact"]
    end
```

| Workflow | File | Trigger | Output |
|---|---|---|---|
| **Frontend CI** | `frontend_ci.yml` | Push/PR to `frontend/**` | `frontend-dist` artifact (7 days) |
| **Backend CI** | `backend_ci.yml` | Push/PR to `backend/**` | Environment verified |
| **Android Build** | `android_build.yml` | Push to `mobile/**` on `main`/`dev` | Signed Debug APK (7 days) |

---

### 🏗️ Infrastructure as Code (Terraform)

The `infrastructure/` directory provisions the **entire production environment from zero** using two providers: `hashicorp/aws ~5.0` and `mongodb/mongodbatlas ~1.15`.

```mermaid
flowchart TD
    TF["terraform apply"]

    TF --> SG["aws_security_group<br/>devops_companion_backend_sg<br/>Inbound: 22, 5000 · Outbound: all"]
    TF --> EC2["aws_instance<br/>t3.micro · Ubuntu 22.04<br/>user_data: install Node 20 + PM2"]
    TF --> PROJ["mongodbatlas_project<br/>DevOpsCompanion"]

    SG --> EC2
    PROJ --> CLUSTER["mongodbatlas_advanced_cluster<br/>M0 · REPLICASET · AWS us-east-1"]
    PROJ --> USER["mongodbatlas_database_user<br/>devops_user · readWriteAnyDatabase"]
    PROJ --> ACL["mongodbatlas_project_ip_access_list<br/>EC2 public_ip → Atlas whitelist"]

    EC2 -->|"public_ip fed into"| ACL

    CLUSTER --> OUT1["Output: mongodb_connection_string"]
    EC2 --> Out2["Output: ec2_public_ip"]
```

**Resources provisioned:**

| Resource | Type | Details |
|---|---|---|
| `aws_security_group` | AWS | Allows SSH (22) and API (5000) |
| `aws_instance` | AWS | `t3.micro` · Ubuntu 22.04 · Node 20 + PM2 via `user_data` |
| `mongodbatlas_project` | Atlas | Project scoped to your Atlas org |
| `mongodbatlas_advanced_cluster` | Atlas | M0 free tier · ReplicaSet |
| `mongodbatlas_database_user` | Atlas | `devops_user` with `readWriteAnyDatabase` |
| `mongodbatlas_project_ip_access_list` | Atlas | EC2 public IP auto-whitelisted |

---

## 🗄️ Data Models

```mermaid
erDiagram
    Entry {
        string topic
        string content
        number hoursSpent
        date createdAt
    }
    Lab {
        string title
        string category
        string status
        string notes
        date completedAt
    }
    Project {
        string name
        string description
        string status
        string githubUrl
    }
    Command {
        string command
        string description
        string category
        string[] tags
    }
    ErrorLog {
        string errorMessage
        string solution
        string context
        date resolvedAt
    }
    Memory {
        string title
        string content
        string category
    }
    Habit {
        string name
        string icon
        string color
        string category
        number targetDays
        date[] completedDates
        number currentStreak
        number longestStreak
    }
    Goal {
        string topic
        number targetHours
        string weekStart
        string notes
    }
    TimerSession {
        string mode
        string topic
        number durationMinutes
        number xpEarned
        date createdAt
    }
    Question {
        string question
        string answer
        string category
        string difficulty
    }
```

---

## 📡 API Reference

The Express server exposes the following REST endpoints on port `5000`:

| Prefix | Route File | Purpose |
|---|---|---|
| `GET /api/health` | `server.js` | Health check (uptime + timestamp) |
| `/api/auth` | `auth.js` | Login / session management |
| `/api/entries` | `entries.js` | CRUD study log entries |
| `/api/labs` | `labs.js` | Lab tracking (create, update status) |
| `/api/projects` | `projects.js` | Side-project management |
| `/api/commands` | `commands.js` | Command reference library |
| `/api/errors` | `errors.js` | Error/solution knowledge base |
| `/api/memory` | `memory.js` | General memory bank |
| `/api/interview` | `interview.js` | Interview Q&A management |
| `/api/habits` | `habits.js` | Habit tracking + streak computation |
| `/api/goals` | `goals.js` | Weekly study goal management |
| `/api/timer` | `timer.js` | Focus timer session logging |
| `/api/reports` | `reports.js` | Aggregated analytics & reports |

---

## 🎯 Application Features

### 📊 Core DevOps Tracker

| Feature | Route | Description |
|---|---|---|
| **Dashboard** | `/` | Overview of XP, streaks, recent activity |
| **Study Entries** | `/entries` | Log daily study sessions with hours & topic |
| **Labs** | `/labs` | Track hands-on labs with completion status |
| **Projects** | `/projects` | Manage side projects with GitHub links |
| **Commands** | `/commands` | Searchable command reference library |
| **Error Log** | `/errors` | Capture errors and their solutions |
| **Memory Bank** | `/memory` | Free-form knowledge snippets |
| **Interview Helper** | `/interview` | Q&A flashcard bank |
| **Reports** | `/reports` | Visual analytics with Recharts |

---

### ⏱️ Focus Timer

**Route:** `/timer`

```
┌─────────────────────────────────────┐
│  🍅 Pomodoro  ⏱ Stopwatch  ⏳ Countdown  │
│                                     │
│           25:00                     │
│         ○ ○ ○ ○  (session dots)     │
│                                     │
│  Topic: [Docker ▼]  Auto-break: ON  │
│  Work: 25 min   Break: 5 min        │
│                                     │
│  XP Earned: 150 ⚡   Sessions: 12   │
└─────────────────────────────────────┘
```

- **3 Timer Modes**: Pomodoro 🍅, Stopwatch ⏱️, Countdown ⏳
- **Auto-Start Breaks**: Toggle automatic transitions after focus sessions
- **Customizable Durations**: Work 5–120 min · Break 1–30 min
- **Topic Tagging**: Link sessions to Docker, Kubernetes, AWS, etc.
- **XP System**: Pomodoro sessions earn **1.5× XP multiplier**
- **4-Pomodoro Cycle Tracker**: Visual dot indicators
- **Desktop Notifications**: Browser alerts on session complete
- **Live Stats Panel**: Total hours, weekly sessions, all-time count

---

### 📅 Habits Tracker

**Route:** `/habits`

```
┌────────────────────────────────────────────────────┐
│ Habit              M  T  W  T  F  S  S   Streak   │
│ 🐳 Docker Practice ✅ ✅ ✅ ✅ ✅ ✅ —    6 days   │
│ 📚 Read TechDocs   ✅ ✅ —  ✅ ✅ ✅ ✅   5 days   │
│ 🔧 Do a Lab        ✅ —  ✅ ✅ ✅ —  ✅   3 days   │
└────────────────────────────────────────────────────┘
```

- **Weekly Grid View**: 7-day at-a-glance for every habit
- **One-Click Check-Off**: Mark today directly from the grid
- **Auto Streak Calculation**: Current and longest streak per habit
- **Custom Icons & Colors**: 12 emoji icons · 8 color themes
- **Categories**: Practice · Reading · Lab · Review · Project · Other
- **Target Days**: Set weekly completion target per habit
- **Summary Stats**: Today's completion rate + combined streaks

---

### 🎯 Study Goals

**Route:** `/goals`

```
Weekly Progress ████████░░ 76%

Docker    ███████████ 5/5 hrs ✅
K8s       ████░░░░░░░ 2/4 hrs
AWS       ██████░░░░░ 3/4 hrs
CI/CD     █████████░░ 3.5/4 hrs
```

- **Weekly Hour Targets**: Per-topic goals for the current week
- **Real-Time Progress**: Auto-reads actual hours from logged entries
- **Animated Progress Bars**: Fill live as you log sessions
- **Master Progress Card**: Combined weekly % with single master bar
- **Completion Celebration**: 🏆 banner at 100%
- **Topic Color Coding**: Signature color per DevOps domain

---

### 🌱 Study Plant

**Route:** `/plant`

```mermaid
graph LR
    A["🌱 Seed<br/>0 XP"] --> B["🌿 Sprout<br/>100 XP"]
    B --> C["🪴 Sapling<br/>300 XP"]
    C --> D["🌳 Bush<br/>600 XP"]
    D --> E["🌲 Young Tree<br/>1000 XP"]
    E --> F["🌴 Tree<br/>1500 XP"]
    F --> G["🌳 Ancient Tree<br/>2500 XP"]
    style G fill:#2d6a2d,color:#fff
```

- **7 Growth Stages**: Seed → Sprout → Sapling → Bush → Young Tree → Tree → Ancient Tree
- **XP-Based Leveling**: Grows from accumulated Focus Timer XP
- **Visual XP Bar**: Progress toward next growth stage with animated fill
- **Click-to-Cheer**: Bounce animation + particle confetti 🎉
- **Topic Breakdown**: Bar chart of most-focused DevOps topics
- **Session History**: Last 10 sessions with XP earned per session

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js** ≥ 20
- **MongoDB** running locally (or Atlas connection string)
- **Terraform** CLI (for infrastructure only)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/DevOps-Study-Companion.git
cd DevOps-Study-Companion
```

### 2. Backend API

```bash
cd backend
cp .env.example .env          # Add your MONGODB_URI and JWT_SECRET
npm install
npm run dev
# Runs on http://localhost:5000
```

### 3. Web Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000 (proxies API calls to :5000)
```

### 4. Mobile App (Android)

```bash
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go, or press 'a' for Android emulator
```

### 5. (Optional) Seed the database

```bash
cd backend
node seed.js
```

---

## 🌍 Infrastructure Deployment (Terraform)

Deploy the full production environment to AWS + MongoDB Atlas:

### Step 1 — Gather credentials

- **AWS**: Configure your credentials via `aws configure` or environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- **MongoDB Atlas**: Retrieve your Org ID, Public API Key, and Private API Key from the Atlas portal

### Step 2 — Create `terraform.tfvars`

```hcl
# infrastructure/terraform.tfvars

atlas_org_id      = "YOUR_ORG_ID"
atlas_public_key  = "YOUR_PUBLIC_KEY"
atlas_private_key = "YOUR_PRIVATE_KEY"

# Optional overrides
aws_region         = "us-east-1"
atlas_project_name = "DevOpsCompanion"
```

> ⚠️ **Never commit `terraform.tfvars` to version control.** It is included in `.gitignore`.

### Step 3 — Initialize and apply

```bash
cd infrastructure
terraform init
terraform plan      # Review what will be created
terraform apply     # Provision everything (~2 min)
```

### Step 4 — Retrieve outputs

```bash
terraform output ec2_public_ip           # Your server IP
terraform output mongodb_connection_string  # Atlas SRV string
```

Set these as environment variables on your EC2 instance and deploy the backend with PM2:

```bash
ssh ubuntu@<ec2_public_ip>
export MONGODB_URI="<mongodb_connection_string>"
pm2 start server.js --name devops-api
```

### Step 5 — Tear down

```bash
terraform destroy   # Remove all provisioned resources
```

---

## 🔐 Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/devops` |
| `PORT` | API server port | `5000` |
| `JWT_SECRET` | Secret key for auth tokens | `supersecretkey123` |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built as a portfolio piece demonstrating full-stack development combined with modern cloud and DevOps engineering.

**⭐ Star this repo if you found it useful!**

</div>
