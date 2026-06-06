# 🚀 DevOps Study Companion

<div align="center">

![DevOps Study Companion](https://img.shields.io/badge/DevOps-Study%20Companion-6C63FF?style=for-the-badge&logo=kubernetes&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

**A full-stack, multi-platform productivity & learning platform for DevOps engineers — built as a live demonstration of enterprise-grade DevOps practices.**

[Features](#-application-features) • [Architecture](#️-devops-architecture) • [CI/CD Pipeline](#-cicd-pipeline) • [Kubernetes](#-kubernetes--gitops) • [Getting Started](#-getting-started)

</div>

---

## 📖 About The Project

**DevOps Study Companion** is more than a study tracker — it is a **production-grade, multi-tier monorepo** that implements the full software delivery lifecycle end-to-end. It was built to simultaneously serve as:

1. **A functional app** — helping DevOps learners track labs, commands, habits, goals, and focus sessions across Web and Android.
2. **A portfolio project** — demonstrating real-world CI/CD, containerization, GitOps, Kubernetes orchestration, and cloud infrastructure skills.

> Every file in this repository — from Dockerfiles to GitHub Actions workflows to Kubernetes manifests — reflects how modern software teams ship code to production.

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
             │  HTTPS / REST API                 │  HTTPS / REST API
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
│                  MongoDB (Atlas / Local)                            │
│                  Port 27017                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

### DevOps Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER WORKSTATION                               │
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
          │ • deploy.yml      │  │ • Commit back to Git    │
          └────────┬──────────┘  └───────────┬─────────────┘
                   │                          │
          ┌────────▼──────────┐   ┌───────────▼─────────────┐
          │   AWS Cloud       │   │      Docker Hub          │
          │                   │   │  (Container Registry)    │
          │ EC2 + PM2         │   │  ntharusha/backend:sha   │
          │ S3 Static Host    │   └───────────┬──────────────┘
          │ CloudFront CDN    │               │
          └───────────────────┘   ┌───────────▼──────────────┐
                                  │  Argo CD (GitOps Agent)  │
                                  │  Watches Git repo        │
                                  │  Syncs k8s/ manifests    │
                                  └───────────┬──────────────┘
                                              │
                                  ┌───────────▼──────────────┐
                                  │   Kubernetes Cluster      │
                                  │   (kind / production)     │
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
                │  ┌────▼────────────────────────────▼──────────────┐      │
                │  │               deploy.yml (on: push main)        │      │
                │  │                                                  │      │
                │  │  Job 1: deploy-backend                           │      │
                │  │  ├─ SSH into EC2                                 │      │
                │  │  ├─ git pull origin main                         │      │
                │  │  ├─ npm install --omit=dev                       │      │
                │  │  ├─ pm2 restart devops-companion-backend         │      │
                │  │  └─ Health check /api/health → HTTP 200          │      │
                │  │                                                  │      │
                │  │  Job 2: deploy-frontend                          │      │
                │  │  ├─ npm run build                                │      │
                │  │  ├─ aws s3 sync dist/ → S3 bucket                │      │
                │  │  └─ CloudFront cache invalidation /*             │      │
                │  └──────────────────────────────────────────────────┘     │
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
                    │       Argo CD             │
                    │  Desired State: :abc123   │
                    │  Actual State:  :xyz789   │
                    │  Status: OutOfSync ⚠️      │
                    └──────────┬───────────────┘
                               │  selfHeal: true
                               │  prune: true
                    ┌──────────▼───────────────┐
                    │    Kubernetes Cluster     │
                    │  Rolling update triggered │
                    │  Old pod → Terminating    │
                    │  New pod → Running ✅      │
                    └──────────────────────────┘
```

---

### Docker Compose Architecture (Local Dev)

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

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization (multi-stage builds) |
| **Docker Compose** | Local multi-service orchestration |
| **GitHub Actions** | CI/CD automation (5 workflows) |
| **Docker Hub** | Container image registry |
| **Kubernetes (kind)** | Container orchestration |
| **Argo CD** | GitOps continuous delivery |
| **AWS EC2** | Backend VM hosting |
| **AWS S3** | Static frontend hosting |
| **AWS CloudFront** | Global CDN + HTTPS |
| **MongoDB Atlas** | Managed cloud database |
| **PM2** | Node.js process manager on EC2 |
| **Nginx** | Reverse proxy for frontend |
| **Terraform** | Infrastructure as Code (IaC) |

---

## 📂 Repository Structure

```
DevOps-Study-Companion/
│
├── .github/
│   └── workflows/
│       ├── frontend_ci.yml      # CI: Vite build validation
│       ├── backend_ci.yml       # CI: Node.js dependency validation
│       ├── android_build.yml    # CD: Android APK build
│       ├── deploy.yml           # CD: Deploy to AWS EC2 + S3 + CloudFront
│       └── gitops.yml           # GitOps: Docker build → manifest update → ArgoCD
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

## 🔄 GitHub Actions Workflows

### 1. `frontend_ci.yml` — Frontend CI
- **Trigger**: Push to `main` when `frontend/**` changes
- **Steps**: Checkout → Setup Node 20 → `npm install` → `npm run build`
- **Purpose**: Ensures the Vite/React app builds successfully before any deployment

### 2. `backend_ci.yml` — Backend CI
- **Trigger**: Push to `main` when `backend/**` changes
- **Steps**: Checkout → Setup Node 20 → `npm install`
- **Purpose**: Validates Node.js dependencies and environment

### 3. `android_build.yml` — Mobile CD
- **Trigger**: Push to `main` (mobile path) or manual dispatch
- **Steps**: Setup Java → Setup Node → Install Expo → Build signed Debug APK
- **Output**: Uploadable APK artifact for physical device testing

### 4. `deploy.yml` — AWS Deployment CD
- **Trigger**: Push to `main` or manual workflow dispatch
- **Job 1 — Backend to EC2**:
  - SSH into EC2 instance using stored secret key
  - `git pull` → `npm install` → `pm2 restart`
  - HTTP health check on `/api/health`
- **Job 2 — Frontend to S3 + CloudFront**:
  - `npm run build` with production `VITE_API_URL`
  - `aws s3 sync` with proper cache headers
  - `aws cloudfront create-invalidation` for instant propagation

### 5. `gitops.yml` — GitOps Pipeline (Docker + ArgoCD)
- **Trigger**: Push to `main` when `backend/**` changes
- **Steps**:
  1. Docker Buildx setup
  2. Docker Hub login
  3. Build & push image tagged `:latest` and `:${{ github.sha }}`
  4. `sed` update `k8s/backend-deployment.yaml` with new SHA tag
  5. Auto-commit the manifest change back to the repo
  6. **Argo CD detects the git change and syncs the cluster automatically**

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

| Tool | Version |
|------|---------|
| Node.js | >= 20 |
| Docker + Docker Compose | Latest |
| MongoDB (local or Atlas URI) | 6.0 |
| kubectl + kind | (for K8s local) |
| Terraform | >= 1.5 (for AWS infra) |

---

### Option A: Docker Compose (Recommended — Full Stack)

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
cp .env.example .env        # Add your MONGODB_URI
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

## ☁️ AWS Infrastructure Deployment (Terraform)

> This provisions a full production environment on AWS from scratch.

1. **Set your credentials** — Create `infrastructure/terraform.tfvars`:
   ```hcl
   atlas_org_id      = "YOUR_ATLAS_ORG_ID"
   atlas_public_key  = "YOUR_PUBLIC_KEY"
   atlas_private_key = "YOUR_PRIVATE_KEY"
   ```

2. **Initialize and apply**:
   ```bash
   cd infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

3. **Terraform provisions**:
   - AWS EC2 `t3.micro` instance with Security Groups (SSH + Port 5000)
   - `user_data` bootstrap script installing Node.js and PM2
   - MongoDB Atlas cluster with database user
   - Auto-whitelisted EC2 public IP in Atlas Network Access

4. **Outputs**: EC2 Public IP + MongoDB Atlas connection string

---

## 🔐 Required GitHub Secrets

| Secret | Used In | Description |
|--------|---------|-------------|
| `EC2_HOST` | `deploy.yml` | EC2 public IP address |
| `EC2_SSH_PRIVATE_KEY` | `deploy.yml` | PEM private key for SSH access |
| `AWS_ACCESS_KEY_ID` | `deploy.yml` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | `deploy.yml` | AWS IAM secret key |
| `S3_BUCKET_NAME` | `deploy.yml` | S3 bucket for frontend hosting |
| `CLOUDFRONT_DISTRIBUTION_ID` | `deploy.yml` | CloudFront distribution ID |
| `DOCKER_HUB_USERNAME` | `gitops.yml` | Docker Hub username |
| `DOCKER_HUB_TOKEN` | `gitops.yml` | Docker Hub access token |

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

**Built to learn DevOps. Deployed with DevOps. Documented for DevOps.**

*A full-stack monorepo demonstrating React · Node.js · MongoDB · Docker · Kubernetes · Argo CD · GitHub Actions · AWS · Terraform*

</div>
