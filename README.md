# 🚀 DevOps Study Companion

<div align="center">

![DevOps Study Companion](https://img.shields.io/badge/DevOps-Study%20Companion-6C63FF?style=for-the-badge&logo=kubernetes&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-kind%20local-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Unified%20CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

**A full-stack, multi-platform productivity & learning platform for DevOps engineers —  
built as a live demonstration of enterprise-grade DevOps practices running entirely on localhost.**

[About](#-about-the-project) • [Architecture](#️-architecture) • [CI/CD](#-cicd-pipeline--cicdyml) • [Kubernetes](#️-kubernetes--gitops) • [Get Started](#-getting-started) • [Features](#-application-features) • [API](#-rest-api-reference)

</div>

---

## 📖 About The Project

**DevOps Study Companion** is more than a study tracker — it's a **production-grade, multi-tier monorepo** that implements the full software delivery lifecycle end-to-end. Built with two goals:

1. **A functional app** — helps DevOps learners track labs, commands, habits, goals, and focus sessions across Web and Android.
2. **A portfolio project** — demonstrates real-world CI/CD, containerization, GitOps, and Kubernetes orchestration skills.

> Every file in this repo — from Dockerfiles to GitHub Actions workflows to Kubernetes manifests — reflects how modern engineering teams ship software.

> **⚠️ Runs on localhost.** No cloud provider required. The Kubernetes cluster uses **kind** (Kubernetes IN Docker) and Argo CD runs inside that local cluster. The only external services are **GitHub Actions** (CI runner) and **Docker Hub** (image registry, free tier).

---

## 🏗️ Architecture

### System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                          CLIENTS / CONSUMERS                          │
│                                                                       │
│   ┌──────────────────────┐       ┌─────────────────────────────────┐  │
│   │   React Web App      │       │   React Native Android App      │  │
│   │   Vite + Nginx       │       │   Expo SDK 54 + MMKV            │  │
│   │   http://localhost:3000│     │   (scan QR via Expo Go)         │  │
│   └──────────┬───────────┘       └────────────────┬────────────────┘  │
└──────────────┼────────────────────────────────────┼───────────────────┘
               │  HTTP REST API                      │  HTTP REST API
┌──────────────▼────────────────────────────────────▼───────────────────┐
│                         BACKEND API LAYER                             │
│                                                                       │
│   Node.js + Express  —  http://localhost:5000                         │
│   ┌───────────────────────────────────────────────────────────────┐   │
│   │  /api/auth    /api/entries  /api/labs     /api/projects       │   │
│   │  /api/habits  /api/goals    /api/timer    /api/commands       │   │
│   │  /api/errors  /api/memory   /api/reports  /api/interview      │   │
│   └───────────────────────────────┬───────────────────────────────┘   │
└───────────────────────────────────┼───────────────────────────────────┘
                                    │  Mongoose ODM
┌───────────────────────────────────▼───────────────────────────────────┐
│                           DATABASE LAYER                              │
│                                                                       │
│   MongoDB 6.0  —  mongodb://localhost:27017                           │
│   Runs as a Docker container (Compose) or K8s Deployment (kind)       │
└───────────────────────────────────────────────────────────────────────┘
```

---

### DevOps Infrastructure Architecture (Localhost)

```
┌──────────────────────────────────────────────────────────────────────┐
│                     DEVELOPER WORKSTATION                            │
│   git push → GitHub (main branch)                                    │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
               ┌───────────▼───────────┐
               │    GitHub Repository   │
               │   (Source of Truth)    │
               └───────┬───────┬────────┘
                       │       │
         ┌─────────────▼──┐  ┌─▼──────────────────────┐
         │ GitHub Actions  │  │  GitHub Actions          │
         │ ci-cd.yml       │  │  ci-cd.yml (gitops job)  │
         │                 │  │                          │
         │ • ci-frontend   │  │ • Docker Buildx          │
         │ • ci-backend    │  │ • Push to Docker Hub     │
         │ • build-android │  │ • Update k8s manifest    │
         └────────┬────────┘  │ • Commit back to Git     │
                  │           └──────────┬───────────────┘
         ┌────────▼──────────┐           │
         │   CI Only         │  ┌────────▼───────────────┐
         │  (build + test)   │  │      Docker Hub         │
         │  No deployment    │  │  ntharusha/backend:sha  │
         └───────────────────┘  └────────┬───────────────┘
                                         │
                               ┌─────────▼───────────────┐
                               │   Argo CD  (localhost)   │
                               │   Watches GitHub repo    │
                               │   Polls k8s/ manifests   │
                               └─────────┬───────────────┘
                                         │  selfHeal + prune
                               ┌─────────▼───────────────┐
                               │  kind Kubernetes Cluster │
                               │  (Kubernetes IN Docker)  │
                               │                          │
                               │  ┌──────────────────┐   │
                               │  │ backend Deployment│   │
                               │  │ replicas: 1       │   │
                               │  │ liveness probe    │   │
                               │  │ readiness probe   │   │
                               │  │ CPU/mem limits    │   │
                               │  └──────────────────┘   │
                               │  ┌──────────────────┐   │
                               │  │ MongoDB Deployment│   │
                               │  │ mongo:6.0         │   │
                               │  │ ClusterIP Service │   │
                               │  └──────────────────┘   │
                               └──────────────────────────┘
```

---

### GitOps Reconciliation Loop

```
                  ┌─────────────────────────────┐
                  │      GitHub Repository       │
                  │  k8s/backend-deployment.yaml │
                  │  image: backend:abc123 (new) │
                  └──────────────┬──────────────┘
                                 │  Argo CD polls every 3 min
                  ┌──────────────▼──────────────┐
                  │      Argo CD (localhost)     │
                  │  Desired State:  :abc123     │
                  │  Actual State:   :xyz789     │
                  │  Status: OutOfSync ⚠️         │
                  └──────────────┬──────────────┘
                                 │  selfHeal: true  /  prune: true
                  ┌──────────────▼──────────────┐
                  │   kind Kubernetes Cluster    │
                  │   Rolling update triggered   │
                  │   Old pod  →  Terminating    │
                  │   New pod  →  Running ✅      │
                  └──────────────────────────────┘
```

---

### Docker Compose Architecture (Local Dev — Quickest Start)

```
┌────────────────────────────────────────────────────────┐
│           docker-compose.yml  (devops-network)          │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  frontend   React + Nginx                       │  │
│  │  Port 3000 → 80 (Nginx serves Vite build)       │  │
│  │  Dockerfile: multi-stage  node → nginx:alpine   │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │ depends_on: backend           │
│  ┌──────────────────────▼──────────────────────────┐  │
│  │  backend    Node.js Express                     │  │
│  │  Port 5000 → 5000                               │  │
│  │  Dockerfile: multi-stage  builder → node:alpine │  │
│  │  USER: node  (non-root security)                │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │ depends_on: mongodb           │
│  ┌──────────────────────▼──────────────────────────┐  │
│  │  mongodb    mongo:6.0                           │  │
│  │  Port 27017 → 27017                             │  │
│  │  Volume: mongodb_data  (persistent)             │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
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

| Tool | Purpose | Runs on |
|------|---------|---------|
| **Docker** | Containerization — multi-stage builds | localhost |
| **Docker Compose** | Multi-service local orchestration | localhost |
| **kind** | Kubernetes IN Docker — local cluster | localhost |
| **Argo CD** | GitOps continuous delivery agent | localhost (in-cluster) |
| **Nginx** | Reverse proxy + SPA serving | localhost (container) |
| **GitHub Actions** | Unified CI/CD pipeline (`ci-cd.yml`) | GitHub cloud |
| **Docker Hub** | Container image registry | cloud (free tier) |

---

## 📂 Repository Structure

```
DevOps-Study-Companion/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # ✅ Unified pipeline: CI + GitOps + Android APK
│
├── backend/
│   ├── Dockerfile               # Multi-stage Node.js production image
│   ├── server.js                # Express app entry point
│   ├── .env.example             # Environment variable template
│   ├── models/                  # Mongoose schemas (12 models)
│   └── routes/                  # REST API route handlers (12 modules)
│
├── frontend/
│   ├── Dockerfile               # Multi-stage Vite build → Nginx image
│   ├── nginx.conf               # SPA routing + API proxy config
│   ├── src/
│   │   ├── pages/               # 17 React page components
│   │   ├── components/          # Reusable UI components
│   │   ├── api.js               # Axios API client (base URL config)
│   │   └── index.css            # Custom design system tokens
│   └── vite.config.js
│
├── mobile/
│   ├── App.js                   # Root navigation + screen registration
│   ├── src/screens/             # React Native screens
│   └── eas.json                 # Expo Application Services config
│
├── k8s/
│   ├── argocd-app.yaml          # Argo CD Application manifest
│   ├── backend-deployment.yaml  # K8s Deployment (image tag auto-updated by GitOps)
│   ├── backend-service.yaml     # K8s Service (ClusterIP, port 5000)
│   ├── frontend-deployment.yaml # K8s Deployment (image tag auto-updated by GitOps)
│   ├── frontend-service.yaml    # K8s Service (ClusterIP, port 80)
│   ├── mongodb.yaml             # MongoDB Deployment + Service (Volume Mounted)
│   ├── mongodb-pvc.yaml         # PersistentVolumeClaim for MongoDB storage
│   └── ingress.yaml             # Ingress routing `/api` to backend, `/` to frontend
│
├── docker-compose.yml           # Full local stack: MongoDB + Backend + Frontend
├── run-local.sh                 # One-command local startup script
└── README.md
```

---

## 🔄 CI/CD Pipeline — `ci-cd.yml`

All pipelines are consolidated into **one unified workflow** with smart path-based job filtering. Each job fires only when its relevant files change — no unnecessary runs.

### Pipeline Flow

```
git push / pull_request  →  main  or  dev
│
├── 🔍 detect-changes     always runs — lightweight path filter
│         │
│         ├─ frontend/**  changed? ──→  🌐 ci-frontend
│         │
│         ├─ backend/**   changed? ──→  🔧 ci-backend
│         │                                    │
│         │                        (must pass) ↓
│         │                            🐳 gitops   ← push to main ONLY (not PRs)
│         │
│         └─ mobile/**    changed? ──→  📱 build-android
│
└── 📋 summary            always runs last — prints all job results
```

### Job Reference

| Job | Trigger condition | Steps | Output |
|-----|------------------|-------|--------|
| **🔍 detect-changes** | Every push / PR | `dorny/paths-filter` checks which dirs changed | Boolean flags consumed by other jobs |
| **🌐 ci-frontend** | `frontend/**` changed | Checkout → Node 20 → `npm install` → `npm run build` | `frontend-dist` artifact (7 days) |
| **🔧 ci-backend** | `backend/**` changed | Checkout → Node 20 → `npm install` → verify env | — |
| **🐳 gitops** | `backend/**` or `frontend/**` changed **+** push to `main` only, after checks pass | Docker Buildx → Hub login → build & push changed images (`:latest` + `:$sha`) → `sed` update deployment manifests → auto-commit `[skip ci]` | Updated K8s manifests → Argo CD syncs cluster |
| **📱 build-android** | `mobile/**` changed | Node 20 + Java 17 (Temurin) + Android SDK → `expo prebuild` → `./gradlew assembleRelease` | `devops-companion-apk` artifact (7 days) |
| **📋 summary** | Always (after all jobs) | Prints pass/fail for every job + commit SHA + branch | Pipeline report in GHA logs |

### Smart Behaviours

| Feature | Detail |
|---------|--------|
| **Concurrency control** | Cancels stale in-progress runs on the same branch when a new push arrives |
| **PR-safe GitOps** | Docker push + manifest commit only execute on `push` to `main` — never on pull requests |
| **Loop prevention** | Auto-commit message contains `[skip ci]` so Argo CD manifest updates don't re-trigger the pipeline |
| **Docker layer cache** | Uses `type=gha` GitHub Actions cache — faster repeat Docker builds |
| **Dependency ordering** | `gitops` has `needs: [ci-backend]` — image is only pushed after CI passes |

### Required GitHub Secrets

| Secret | Used in job | Description |
|--------|------------|-------------|
| `DOCKER_HUB_USERNAME` | `gitops` | Docker Hub username |
| `DOCKER_HUB_TOKEN` | `gitops` | Docker Hub access token |

---

## ☸️ Kubernetes & GitOps

### Kubernetes Manifests (`k8s/`)

| File | Kind | Details |
|------|------|---------|
| `frontend-deployment.yaml` | `Deployment` | 1 replica · liveness & readiness probes · CPU 50–200m · Mem 64–128Mi |
| `frontend-service.yaml` | `Service` | ClusterIP · port 80 |
| `backend-deployment.yaml` | `Deployment` | 1 replica · liveness & readiness probes · CPU 100–300m · Mem 128–256Mi |
| `backend-service.yaml` | `Service` | ClusterIP · port 5000 |
| `mongodb.yaml` | `Deployment` + `Service` | mongo:6.0 · PVC volume mounted · ClusterIP · CPU 250–500m · Mem 256–512Mi |
| `mongodb-pvc.yaml` | `PersistentVolumeClaim` | 2Gi storage capacity · ReadWriteOnce access mode |
| `ingress.yaml` | `Ingress` | Nginx Ingress routing · `/api` -> Backend · `/` -> Frontend |
| `argocd-app.yaml` | `Application` | Watches `k8s/` path on `main` branch · automated sync |

### Argo CD Sync Policy

```yaml
# k8s/argocd-app.yaml
syncPolicy:
  automated:
    prune: true      # Auto-delete orphaned K8s resources when removed from Git
    selfHeal: true   # Auto-revert manual kubectl changes (drift detection)
  syncOptions:
    - CreateNamespace=true
```

### Backend Health Probes

```yaml
# k8s/backend-deployment.yaml
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

### Resource Limits

```yaml
resources:
  limits:
    cpu: "300m"
    memory: "256Mi"
  requests:
    cpu: "100m"
    memory: "128Mi"
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Node.js ≥ 20 | Backend & frontend dev | [nodejs.org](https://nodejs.org) |
| Docker + Docker Compose | Container runtime | [docker.com](https://docker.com) |
| kind | Local Kubernetes cluster | `go install sigs.k8s.io/kind@latest` |
| kubectl | Kubernetes CLI | [kubectl install](https://kubernetes.io/docs/tasks/tools/) |
| Argo CD CLI | GitOps management (optional) | `brew install argocd` |

---

### ▶️ Option A — Docker Compose (Recommended · Fastest)

```bash
# Clone the repo
git clone https://github.com/Ntharusha/DevOps-Study-Companion.git
cd DevOps-Study-Companion

# Start all services (MongoDB + Backend + Frontend)
docker-compose up --build

# ✅ Access:
#   Web App  →  http://localhost:3000
#   API      →  http://localhost:5000/api/health
#   MongoDB  →  mongodb://localhost:27017
```

---

### ▶️ Option B — Run Services Manually

```bash
# 1. Backend API
cd backend
cp .env.example .env          # Set MONGODB_URI=mongodb://localhost:27017/devops-study-companion
npm install
npm run dev                   # → http://localhost:5000

# 2. Web Frontend
cd frontend
npm install
npm run dev                   # → http://localhost:3000

# 3. Mobile App (Android)
cd mobile
npm install
npx expo start                # Scan QR with Expo Go
```

---

### ▶️ Option C — One-Line Script

```bash
chmod +x run-local.sh
./run-local.sh
```

---

### ▶️ Option D — Full GitOps Stack (kind + Argo CD)

> Runs the full production-like pipeline entirely on your machine.

```bash
# 1. Create a local Kubernetes cluster
kind create cluster --name devops-companion

# 2. Install Argo CD
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Wait for Argo CD to be ready
kubectl wait --for=condition=available --timeout=120s \
  deployment/argocd-server -n argocd

# 4. Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo

# 5. Open Argo CD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# → https://localhost:8080   (admin / <password from step 4>)

# 6. Apply the Argo CD Application manifest
kubectl apply -f k8s/argocd-app.yaml

# 7. Port-forward the services to access locally:
# Access the React Web App at http://localhost:3000
kubectl port-forward svc/frontend 3000:80

# Access the Backend API at http://localhost:5000/api/health
kubectl port-forward svc/backend 5000:5000
```

Once set up, every `git push` to `main` that changes `backend/**` will:
1. Run CI via GitHub Actions (`ci-cd.yml`)
2. Build and push a new Docker image to Docker Hub
3. Update `k8s/backend-deployment.yaml` with the new image SHA
4. Commit the manifest change back to GitHub
5. Argo CD detects the git change and rolls out the new pod automatically ✅

---

## 🎯 Application Features

### 📊 Dashboard
Real-time summary — XP points, streaks, recent entries, weekly study hours with interactive Recharts graphs.

### 📝 Study Entries (`/entries`)
Log daily DevOps study sessions with topic tags, duration, difficulty ratings, and markdown notes.

### 🧪 Labs (`/labs`)
Track hands-on lab completions. Records tool used, status, key learnings, and commands run.

### 📋 Projects (`/projects`)
Track DevOps projects from idea to completion — tech stack, status, and progress notes.

### ⏱️ Focus Timer (`/timer`)
- **Pomodoro 🍅 / Stopwatch ⏱️ / Countdown ⏳** modes
- Auto-start breaks, topic tagging, XP rewards, desktop notifications

### 📅 Habits Tracker (`/habits`)
- Weekly grid view with one-click check-off
- Streak tracking, custom icons, category filters, target days per week

### 🎯 Study Goals (`/goals`)
- Weekly hour targets per DevOps topic
- Real-time progress from logged sessions, animated progress bars + 🏆 celebration

### 🧠 Memory Bank (`/memory`)
Store DevOps concepts, code snippets, and mental models in a searchable knowledge vault.

### 💻 Commands (`/commands`)
CLI reference library with category tags and one-click copy-to-clipboard.

### 🐛 Error Log (`/errors`)
Document production errors and their solutions — a personal runbook.

### 🎤 Interview Helper (`/interview`)
Question bank with mock interview mode. Practice and store answers for DevOps technical rounds.

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
| Storage | MMKV (C++ native — 10× faster than AsyncStorage) |
| Navigation | React Navigation stack |
| Screens | Dashboard, Projects, Labs, Study Entries |
| Build | `expo prebuild` + Gradle `assembleRelease` |
| CI | `build-android` job in `ci-cd.yml` produces signed APK artifact |

---

## 🌐 REST API Reference

Base URL: `http://localhost:5000/api`

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/health` | `GET` | Service health check |
| `/auth` | `POST` | Register / Login |
| `/entries` | `GET POST PUT DELETE` | Study entries CRUD |
| `/labs` | `GET POST PUT DELETE` | Lab tracking |
| `/projects` | `GET POST PUT DELETE` | Project management |
| `/habits` | `GET POST PUT DELETE` | Habit tracking + check-off |
| `/goals` | `GET POST PUT DELETE` | Weekly study goals |
| `/timer` | `GET POST` | Focus timer sessions |
| `/commands` | `GET POST DELETE` | Command reference library |
| `/errors` | `GET POST DELETE` | Error log entries |
| `/memory` | `GET POST DELETE` | Memory bank items |
| `/interview` | `GET POST DELETE` | Interview Q&A bank |
| `/reports` | `GET` | Analytics & aggregated data |

---

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature

# 3. Make your changes and commit
git commit -m 'feat: describe your change'

# 4. Push and open a Pull Request
git push origin feature/your-feature
```

GitHub Actions CI (`ci-cd.yml`) will automatically run build checks on your PR.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built to learn DevOps. Deployed locally. Documented for the community.**

*React · Node.js · MongoDB · Docker · Kubernetes (kind) · Argo CD · GitHub Actions*

</div>
