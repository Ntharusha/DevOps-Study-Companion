# 🚀 DevOps Study Companion

<div align="center">

![DevOps Study Companion](https://img.shields.io/badge/DevOps-Study%20Companion-6C63FF?style=for-the-badge&logo=kubernetes&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-kind%20(local)-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

**A full-stack, multi-platform productivity & learning platform for DevOps engineers — built as a live demonstration of enterprise-grade DevOps practices.**

[Features](#-application-features) • [Architecture](#️-devops-architecture) • [CI/CD Pipeline](#-cicd-pipeline) • [Kubernetes](#-kubernetes--gitops) • [Getting Started](#-getting-started)

</div>

---

## 📖 About The Project

**DevOps Study Companion** is more than a study tracker — it is a **production-grade, multi-tier monorepo** that implements the full software delivery lifecycle end-to-end. It was built to simultaneously serve as:

1. **A functional app** — helping DevOps learners track labs, commands, habits, goals, and focus sessions across Web and Android.
2. **A portfolio project** — demonstrating real-world CI/CD, containerization, GitOps, Kubernetes orchestration, and infrastructure-as-code skills.

> Every file in this repository — from Dockerfiles to GitHub Actions workflows to Kubernetes manifests — reflects how modern software teams ship code to production.

> **⚠️ Runtime note:** This project runs entirely on **localhost**. The Kubernetes cluster uses **kind** (Kubernetes IN Docker) and ArgoCD runs locally. No cloud provider is required to run this project.

---

## 🏗️ DevOps Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTS / CONSUMERS                          │
│                                                                     │
│   ┌──────────────────┐         ┌───────────────────────────────┐   │
│   │  React Web App   │         │   React Native Android App    │   │
│   │  (Vite + Nginx)  │         │   (Expo SDK 54 + MMKV)        │   │
│   └────────┬─────────┘         └──────────────┬────────────────┘   │
│            │                                   │                   │
└────────────┼───────────────────────────────────┼───────────────────┘
             │  HTTP / REST API                  │  HTTP / REST API
┌────────────▼───────────────────────────────────▼───────────────────┐
│                     BACKEND API LAYER                               │
│                                                                     │
│          Node.js + Express  (Port 5000)                             │
│          ┌──────────────────────────────────────────────┐          │
│          │  /api/auth     /api/entries   /api/labs       │          │
│          │  /api/projects /api/habits    /api/goals      │          │
│          │  /api/timer    /api/commands  /api/errors     │          │
│          │  /api/memory   /api/reports   /api/interview  │          │
│          └─────────────────────┬────────────────────────┘          │
└────────────────────────────────┼───────────────────────────────────┘
                                 │ Mongoose ODM
┌────────────────────────────────▼───────────────────────────────────┐
│                      DATABASE LAYER                                 │
│                                                                     │
│                  MongoDB (Local — Port 27017)                       │
│                  Runs in Docker container                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

### DevOps Infrastructure Architecture (Localhost)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER WORKSTATION (localhost)                   │
│                                                                             │
│    git push → GitHub (main branch)                                          │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   GitHub Repository  │
                    │  (Source of Truth)   │
                    └──────┬──────┬────────┘
                           │      │
          ┌────────────────▼──┐  ┌▼──────────────────────┐
          │  GitHub Actions   │  │  GitHub Actions         │
          │  CI Pipelines     │  │  GitOps Pipeline        │
          │                   │  │                         │
          │ • frontend_ci.yml │  │ • Build Docker Image    │
          │ • backend_ci.yml  │  │ • Push to Docker Hub    │
          │ • android_build   │  │ • Update k8s manifest   │
          └────────┬──────────┘  │ • Commit back to Git    │
                   │             └───────────┬─────────────┘
          ┌────────▼──────────┐              │
          │  CI Result Only   │  ┌───────────▼──────────────┐
          │  (build + test)   │  │      Docker Hub          │
          │  No deployment    │  │  (Container Registry)    │
          └───────────────────┘  │  ntharusha/backend:sha   │
                                 └───────────┬──────────────┘
                                             │
                                 ┌───────────▼──────────────┐
                                 │  Argo CD (localhost)      │
                                 │  Watches Git repo        │
                                 │  Syncs k8s/ manifests    │
                                 └───────────┬──────────────┘
                                             │
                                 ┌───────────▼──────────────┐
                                 │   kind Kubernetes Cluster │
                                 │   (Kubernetes IN Docker)  │
                                 │                           │
                                 │  ┌─────────────────────┐  │
                                 │  │ backend Deployment  │  │
                                 │  │ replicas: 1         │  │
                                 │  │ liveness probe      │  │
                                 │  │ readiness probe     │  │
                                 │  └─────────────────────┘  │
                                 │  ┌─────────────────────┐  │
                                 │  │ MongoDB StatefulSet │  │
                                 │  │ PVC: mongodb-data   │  │
                                 │  └─────────────────────┘  │
                                 └───────────────────────────┘
```

---

### CI/CD Pipeline Flow

```
┌──────────┐    ┌───────────────────────────────────────────────────────────┐
│ git push │───▶│                  GITHUB ACTIONS                            │
│  (main)  │    │                                                           │
└──────────┘    │  Path: backend/**          Path: frontend/**              │
                │       │                          │                        │
                │  ┌────▼────────────┐   ┌─────────▼──────────────┐        │
                │  │ backend_ci.yml  │   │  frontend_ci.yml        │        │
                │  │ Install deps    │   │  Install deps           │        │
                │  │ Validate env    │   │  npm run build (Vite)   │        │
                │  └────┬────────────┘   └─────────┬──────────────┘        │
                │       │                           │                       │
                │       └─────────── CI only ───────┘                      │
                │             (no cloud deployment)                         │
                │                                                            │
                │  ┌──────────────────────────────────────────────────┐     │
                │  │               gitops.yml (GitOps Path)            │     │
                │  │                                                   │     │
                │  │  ├─ Docker Buildx setup                           │     │
                │  │  ├─ Login to Docker Hub                           │     │
                │  │  ├─ Build & push image :latest + :${{ sha }}      │     │
                │  │  ├─ sed update k8s/backend-deployment.yaml        │     │
                │  │  └─ git-auto-commit → triggers ArgoCD sync        │     │
                │  └──────────────────────────────────────────────────┘     │
                │         ↓ ArgoCD (running locally) detects change          │
                │         ↓ Syncs to kind cluster on localhost               │
                └───────────────────────────────────────────────────────────┘
```

---

### GitOps Reconciliation Loop

```
                    ┌──────────────────────────┐
                    │    GitHub Repository      │
                    │  k8s/backend-deploy.yaml  │
                    │  image: :abc123 (new SHA) │
                    └──────────┬───────────────┘
                               │  Argo CD polls every 3 min
                               │  (or webhook push)
                    ┌──────────▼───────────────┐
                    │    Argo CD (localhost)    │
                    │  Desired State: :abc123   │
                    │  Actual State:  :xyz789   │
                    │  Status: OutOfSync ⚠️      │
                    └──────────┬───────────────┘
                               │  selfHeal: true
                               │  prune: true
                    ┌──────────▼───────────────┐
                    │  kind Kubernetes Cluster  │
                    │  Rolling update triggered │
                    │  Old pod → Terminating    │
                    │  New pod → Running ✅      │
                    └──────────────────────────┘
```

---

### Docker Compose Architecture (Primary Local Dev)

```
┌─────────────────────────────────────────────────────────┐
│              docker-compose.yml (devops-network)         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  frontend (React + Nginx)                        │  │
│  │  Port: 3000 → 80                                 │  │
│  │  Dockerfile: multi-stage (node → nginx:alpine)   │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │ depends_on: backend                  │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │  backend (Node.js Express)                        │  │
│  │  Port: 5000 → 5000                                │  │
│  │  Dockerfile: multi-stage (builder → node:alpine)  │  │
│  │  USER: node (non-root security)                   │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │ depends_on: mongodb                  │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │  mongodb (mongo:6.0)                              │  │
│  │  Port: 27017 → 27017                              │  │
│  │  Volume: mongodb_data (persistent)                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Application Layer

| Layer | Technology | Version |
|-------|-----------|---------| 
| Web Frontend | React + Vite | 18 / 5.x |
| Styling | Vanilla CSS (custom design system) | — |
| Charts | Recharts | 2.x |
| Backend API | Node.js + Express | 20 / 4.x |
| ODM | Mongoose | 8.x |
| Database | MongoDB | 6.0 |
| Mobile | React Native + Expo | 0.81 / SDK 54 |
| Mobile Storage | MMKV (C++ native) | — |

### DevOps & Infrastructure Layer

| Tool | Purpose | Where it runs |
|------|---------|---------------|
| **Docker** | Containerization (multi-stage builds) | localhost |
| **Docker Compose** | Multi-service orchestration | localhost |
| **GitHub Actions** | CI/CD automation (1 unified workflow) | GitHub cloud |
| **Docker Hub** | Container image registry | cloud (free tier) |
| **kind** | Kubernetes cluster (Kubernetes IN Docker) | localhost |
| **Argo CD** | GitOps continuous delivery | localhost (in-cluster) |
| **Nginx** | Reverse proxy for frontend container | localhost |

---

## 📂 Repository Structure

```
DevOps-Study-Companion/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # Unified pipeline: CI + GitOps + Android APK
│
├── backend/
│   ├── Dockerfile               # Multi-stage Node.js production image
│   ├── server.js                # Express app entry point
│   ├── models/                  # Mongoose schemas
│   └── routes/                  # REST API route handlers (12 modules)
│
├── frontend/
│   ├── Dockerfile               # Multi-stage Vite → Nginx image
│   ├── nginx.conf               # Custom Nginx config (SPA routing + proxy)
│   ├── src/
│   │   ├── pages/               # 17 React page components
│   │   ├── components/          # Reusable UI components
│   │   ├── api.js               # Axios API client
│   │   └── index.css            # Custom design system
│   └── vite.config.js
│
├── mobile/
│   ├── App.js                   # Root navigation + screens
│   ├── src/screens/             # React Native screens
│   └── eas.json                 # Expo Application Services config
│
├── k8s/
│   ├── argocd-app.yaml          # Argo CD Application manifest
│   ├── backend-deployment.yaml  # K8s Deployment (auto-updated by GitOps)
│   ├── backend-service.yaml     # K8s Service
│   └── mongodb.yaml             # MongoDB StatefulSet + PVC
│
├── docker-compose.yml           # Full local stack (MongoDB + Backend + Frontend)
├── run-local.sh                 # One-command local startup script
└── README.md
```

---

## 🔄 GitHub Actions Workflow — `ci-cd.yml`

All pipelines are consolidated into **one smart workflow** with path-based job filtering. Each job runs only when its relevant files change.

```
git push / pull_request → main or dev
│
├── 🔍 detect-changes   (always runs — determines which jobs fire)
│         │
│         ├── frontend/**  changed? ──→ 🌐 ci-frontend
│         │
│         ├── backend/**   changed? ──→ 🔧 ci-backend ──→ 🐳 gitops (main only)
│         │
│         └── mobile/**    changed? ──→ 📱 build-android
│
└── 📋 summary          (always runs — reports all job results)
```

### Job Details

| Job | Trigger | Steps | Output |
|-----|---------|-------|--------|
| **🔍 detect-changes** | Every push/PR | Checks which paths changed | Outputs flags for other jobs |
| **🌐 ci-frontend** | `frontend/**` changed | Checkout → Node 20 → `npm install` → `npm run build` | `frontend-dist` artifact |
| **🔧 ci-backend** | `backend/**` changed | Checkout → Node 20 → `npm install` → verify env | — |
| **🐳 gitops** | `backend/**` changed + push to `main` only (after `ci-backend` passes) | Docker Buildx → Docker Hub login → Build & push `:latest` + `:sha` → Update `k8s/backend-deployment.yaml` → Auto-commit | Updated manifest (ArgoCD picks up) |
| **📱 build-android** | `mobile/**` changed | Node 20 + Java 17 + Android SDK → Expo prebuild → Gradle `assembleRelease` | APK artifact |
| **📋 summary** | Always (after all jobs) | Prints result of every job | Pipeline report |

### Smart Behaviours
- **`concurrency`** — cancels previous in-progress runs on the same branch when you push again
- **`gitops` is PR-safe** — Docker push and manifest update only happen on `push` to `main`, never on pull requests
- **`[skip ci]`** — the auto-commit of the manifest update includes `[skip ci]` to prevent an infinite loop
- **Docker layer caching** — uses GitHub Actions cache (`type=gha`) to speed up repeated Docker builds

---

## ☸️ Kubernetes & GitOps

### Kubernetes Manifests (`k8s/`)

| Manifest | Resource | Details |
|----------|----------|---------| 
| `backend-deployment.yaml` | `Deployment` | 1 replica, liveness + readiness probes, CPU/memory limits |
| `backend-service.yaml` | `Service` | ClusterIP exposing port 5000 |
| `mongodb.yaml` | `StatefulSet` | Persistent volume for data durability |
| `argocd-app.yaml` | `Application` | Argo CD app pointing to `k8s/` path on `dev` branch |

### Argo CD Configuration

```yaml
# k8s/argocd-app.yaml
syncPolicy:
  automated:
    prune: true      # Auto-delete orphaned resources
    selfHeal: true   # Auto-revert manual kubectl changes
  syncOptions:
    - CreateNamespace=true
```

### Health Checks

The backend Kubernetes pod has both probes configured:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 15
  periodSeconds: 20

readinessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 20 | Backend & frontend dev |
| Docker + Docker Compose | Latest | Container runtime |
| kind | Latest | Local Kubernetes cluster |
| kubectl | Latest | Kubernetes CLI |
| ArgoCD CLI | Latest | GitOps management (optional) |

---

### Option A: Docker Compose (Recommended — Quickest Start)

```bash
# Clone the repository
git clone https://github.com/Ntharusha/DevOps-Study-Companion.git
cd DevOps-Study-Companion

# Start all services (MongoDB + Backend + Frontend)
docker-compose up --build

# Access:
# Web App  → http://localhost:3000
# API      → http://localhost:5000/api/health
# MongoDB  → mongodb://localhost:27017
```

---

### Option B: Run Services Manually

#### 1. Backend API
```bash
cd backend
cp .env.example .env        # Set MONGODB_URI=mongodb://localhost:27017/devops-study-companion
npm install
npm run dev                 # Runs on http://localhost:5000
```

#### 2. Web Frontend
```bash
cd frontend
npm install
npm run dev                 # Runs on http://localhost:3000
```

#### 3. Mobile App (Android)
```bash
cd mobile
npm install
npx expo start              # Scan QR with Expo Go app
```

---

### Option C: One-Line Local Script

```bash
chmod +x run-local.sh
./run-local.sh
```

---

### Option D: Kubernetes + ArgoCD (Full GitOps — Local)

> Runs the production-like stack entirely on your machine using **kind** and **Argo CD**.

```bash
# 1. Create a kind cluster
kind create cluster --name devops-companion

# 2. Install Argo CD into the cluster
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Wait for Argo CD to be ready
kubectl wait --for=condition=available --timeout=120s deployment/argocd-server -n argocd

# 4. Port-forward the Argo CD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 5. Apply the ArgoCD Application manifest
kubectl apply -f k8s/argocd-app.yaml

# Access:
# Argo CD UI  → https://localhost:8080
# Backend API → http://localhost:5000/api/health  (after port-forwarding the service)
```

---

## 🔐 Required Secrets (for GitOps workflow only)

| Secret | Used In | Description |
|--------|---------|-------------|
| `DOCKER_HUB_USERNAME` | `gitops.yml` | Docker Hub username |
| `DOCKER_HUB_TOKEN` | `gitops.yml` | Docker Hub access token |

> The `deploy.yml` workflow references additional AWS secrets (`EC2_HOST`, `AWS_ACCESS_KEY_ID`, etc.) but that workflow is **not active** — it serves as a reference template for cloud deployment.

---

## 🎯 Application Features

### 📊 Dashboard
Real-time summary of all activity — XP, streaks, recent entries, and weekly study hours with interactive charts (Recharts).

### 📝 Study Entries (`/entries`)
Log daily DevOps study sessions with topic tagging, duration tracking, difficulty ratings, and markdown notes.

### 🧪 Labs (`/labs`)
Track hands-on lab completions. Each lab records the tool used, status, key learnings, and commands run.

### 📋 Projects (`/projects`)
Track DevOps projects from idea to completion with tech stack, status, and progress notes.

### ⏱️ Focus Timer (`/timer`)
- **Pomodoro 🍅 / Stopwatch ⏱️ / Countdown ⏳** modes
- Auto-start breaks, topic tagging, XP rewards
- Desktop notifications + live stats panel

### 📅 Habits Tracker (`/habits`)
- Weekly grid view with one-click check-off
- Streak tracking, custom icons, category filters
- Target days per week configuration

### 🎯 Study Goals (`/goals`)
- Weekly hour targets per DevOps topic
- Real-time progress from logged sessions
- Animated progress bars + 🏆 completion celebration

### 🧠 Memory Bank (`/memory`)
Store key DevOps concepts, snippets, and mental models in a searchable knowledge vault.

### 💻 Commands (`/commands`)
Reference library for frequently used CLI commands with category tags and copy-to-clipboard.

### 🐛 Error Log (`/errors`)
Document production errors and their solutions — a personal runbook.

### 🎤 Interview Helper (`/interview`)
Question bank with mock interview mode. Practice and store answers for DevOps technical interviews.

### 📈 Reports (`/reports`)
Analytics dashboard — study heatmap, topic distribution charts, weekly/monthly breakdowns.

### 🌱 Study Plant (`/plant`)
- 7 growth stages driven by XP accumulation
- Click-to-cheer animations with particle effects
- Topic focus breakdown bar chart

---

## 📱 Mobile App (Android)

Built with **React Native 0.81 + Expo SDK 54**.

| Feature | Details |
|---------|---------| 
| Storage | MMKV (C++ backed, 10x faster than AsyncStorage) |
| Navigation | React Navigation stack |
| Screens | Projects, Labs, Entries, Dashboard |
| Build | EAS Build (Expo Application Services) |
| CI | `android_build.yml` produces signed Debug APK |

---

## 🌐 REST API Reference

Base URL: `http://localhost:5000/api`

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/health` | GET | Service health check |
| `/auth` | POST | Authentication |
| `/entries` | GET, POST, PUT, DELETE | Study entries CRUD |
| `/labs` | GET, POST, PUT, DELETE | Lab tracking |
| `/projects` | GET, POST, PUT, DELETE | Project management |
| `/habits` | GET, POST, PUT, DELETE | Habit tracking + check-off |
| `/goals` | GET, POST, PUT, DELETE | Weekly study goals |
| `/timer` | GET, POST | Focus timer sessions |
| `/commands` | GET, POST, DELETE | Command reference |
| `/errors` | GET, POST, DELETE | Error log entries |
| `/memory` | GET, POST, DELETE | Memory bank items |
| `/interview` | GET, POST, DELETE | Interview Q&A bank |
| `/reports` | GET | Analytics & aggregations |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request — CI will run automatically

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built to learn DevOps. Deployed locally. Documented for DevOps.**

*A full-stack monorepo demonstrating React · Node.js · MongoDB · Docker · Kubernetes (kind) · Argo CD · GitHub Actions*

</div>
