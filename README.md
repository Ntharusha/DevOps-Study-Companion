# 🚀 DevOps Study Companion (Full-Stack & DevOps Portfolio Project)

**DevOps Study Companion** is a comprehensive productivity and learning platform designed specifically for DevOps engineers and learners. 

More importantly, this repository serves as a **live demonstration of modern DevOps practices**. The project is structured as a multi-tier monorepo (Frontend, Backend, Mobile) wrapped in enterprise-grade infrastructure, CI/CD automation, and Infrastructure as Code (IaC).

---

## 🏗️ Architecture & DevOps Practices

This project implements a real-world software delivery lifecycle:

### 1. 🔄 Continuous Integration (CI)
Automated GitHub Actions trigger independently based on path modifications:
- **`frontend_ci.yml`**: Automatically installs dependencies and builds the Vite/React static assets to ensure build integrity before deployment.
- **`backend_ci.yml`**: Validates the Node.js/Express environment and dependencies.

### 2. 🚢 Continuous Delivery & Mobile Builds
- **`android_build.yml`**: An automated pipeline that provisions an Ubuntu runner, sets up Java and Node.js, compiles the React Native C++ core for multiple architectures, and produces a fully signed **Debug APK** ready for physical device testing.

### 3. ☁️ Infrastructure as Code (Terraform)
The `infrastructure/` directory contains HashiCorp Terraform configurations to provision the production environment from scratch:
- **AWS EC2 Provisioning**: Automatically spins up a `t3.micro` instance, configures Security Groups (SSH, Port 5000), and injects a `user_data` bash script to install Node.js and PM2 on boot.
- **Database Automation**: Provisions a MongoDB Atlas cluster, creates database users, and automatically whitelists the new AWS EC2 instance's public IP address for zero-trust security.

---

## 💻 Tech Stack

### Application Layer
- **Frontend**: React 18, Vite, Recharts
- **Backend**: Node.js, Express, Mongoose
- **Mobile**: React Native 0.81, Expo SDK 54, MMKV (High-performance native storage)
- **Database**: MongoDB (Atlas)

### DevOps & Cloud Layer
- **Automation**: GitHub Actions
- **IaC**: Terraform
- **Cloud Provider**: AWS (EC2, Security Groups)
- **DBaaS**: MongoDB Atlas

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js >= 20
- MongoDB running locally (or Atlas connection string)
- Terraform (for infrastructure deployment)

### 1. Backend API
```bash
cd backend
npm install
npm run dev
```
*Runs on `http://localhost:5000`*

### 2. Web Frontend
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:3000` and proxies to the backend.*

### 3. Mobile App (Android)
```bash
cd mobile
npm install
npx expo start
```

---

## 🌍 Infrastructure Deployment (Terraform)

To deploy the production infrastructure to AWS and MongoDB Atlas:

1. Retrieve your MongoDB Atlas API Keys (Org ID, Public Key, Private Key).
2. Create a `terraform.tfvars` file inside the `infrastructure/` directory:
   ```hcl
   atlas_org_id      = "YOUR_ORG_ID"
   atlas_public_key  = "YOUR_PUBLIC_KEY"
   atlas_private_key = "YOUR_PRIVATE_KEY"
   ```
3. Initialize and apply the infrastructure:
   ```bash
   cd infrastructure
   terraform init
   terraform apply
   ```
4. Terraform will output your new EC2 Public IP and your secure MongoDB Connection String.

---

## 🎯 Application Features

### 📚 Core DevOps Tracker
- **Multi-Platform Access**: Track studies via the Web Dashboard or the Native Android app.
- **Gamified Learning**: Level up, gain XP, and track streaks based on completed labs and projects.
- **Knowledge Base**: Store commands, errors, and solutions in a structured memory bank.
- **High-Performance Storage**: Mobile app utilizes C++ backed MMKV for instant local data persistence.

### 🆕 Study Tools (StudiesTimer-Inspired Features)

#### ⏱️ Focus Timer (`/timer`)
- **Three Timer Modes**: Pomodoro 🍅, Stopwatch ⏱️, and Countdown ⏳
- **Auto-Start Breaks**: Toggle automatic break transitions after each focus session
- **Fully Customizable**: Set any work duration (5–120 min) and break duration (1–30 min)
- **Topic Tagging**: Link every session to a DevOps topic (Docker, Kubernetes, AWS, etc.)
- **XP System**: Earn XP for every completed session (Pomodoro sessions earn 1.5× XP)
- **Session Counter**: Visual dot tracker for 4-Pomodoro cycle
- **Desktop Notifications**: Browser notifications when sessions complete
- **Live Stats Panel**: Total hours, weekly sessions, and all-time session count

#### 📅 Habits Tracker (`/habits`)
- **Weekly Grid View**: See all 7 days of the week at a glance for each habit
- **One-Click Check-Off**: Mark today's habit complete directly from the grid
- **Streak Tracking**: Current and longest streaks calculated automatically per habit
- **Custom Icons & Colors**: Pick from 12 emoji icons and 8 color themes
- **Categories**: Organize habits as Practice, Reading, Lab, Review, Project, or Other
- **Target Days**: Set how many days/week each habit should be completed
- **Summary Stats**: Today's completion rate and combined streak count

#### 🎯 Study Goals (`/goals`)
- **Weekly Hour Targets**: Set topic-specific hour goals for the current week
- **Real-Time Progress**: Automatically reads actual study hours from your logged entries
- **Animated Progress Bars**: Per-topic bars fill as you log study sessions
- **Master Progress Card**: Overall weekly progress shown as a combined % with master bar
- **Completion Celebration**: 🏆 banner when you hit 100% of your weekly goal
- **Topic Color Coding**: Each DevOps topic gets its signature color
- **Notes Support**: Add context or resource links to each goal

#### 🌱 Study Plant (`/plant`)
- **7 Growth Stages**: Seed → Sprout → Sapling → Bush → Young Tree → Tree → Ancient Tree
- **XP-Based Leveling**: Plant grows as you accumulate XP from Focus Timer sessions
- **Visual XP Bar**: Shows progress toward next plant level with animated fill
- **Roadmap Display**: Visual emoji roadmap showing all levels and current position
- **Click-to-Cheer**: Click your plant for a bounce animation with particle effects 🎉
- **Topic Breakdown**: Bar chart showing which DevOps topics you've focused on most
- **Session History**: Last 10 focus sessions with XP earned per session

---
*Built as a portfolio piece to demonstrate full-stack development combined with modern cloud and DevOps engineering.*
