#!/bin/bash

# DevOps Study Companion Local Runner Script
# Usage: ./run-local.sh [start|stop|restart|status|logs|clean|local-start|local-stop|local-status|local-logs]

set -e

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_NC='\033[0m' # No Color

BACKEND_PID_FILE=".backend.pid"
FRONTEND_PID_FILE=".frontend.pid"
BACKEND_LOG="backend.log"
FRONTEND_LOG="frontend.log"

function show_usage() {
    echo -e "${COLOR_YELLOW}Usage:${COLOR_NC}"
    echo "  Docker options:"
    echo "    $0 start         - Start via Docker Compose (requires Docker daemon)"
    echo "    $0 stop          - Stop Docker Compose services"
    echo "    $0 restart       - Rebuild and restart Docker Compose services"
    echo "    $0 status        - Show Docker Compose services status"
    echo "    $0 logs          - View Docker Compose logs"
    echo "    $0 clean         - Stop Docker Compose services and delete volumes"
    echo ""
    echo "  Local Node/NPM options (No Docker required):"
    echo "    $0 local-start   - Start backend & frontend processes locally"
    echo "    $0 local-stop    - Stop local processes"
    echo "    $0 local-status  - Check local processes status"
    echo "    $0 local-logs    - Follow logs for local processes"
}

function check_docker() {
    if ! [ -x "$(command -v docker)" ]; then
        echo -e "${COLOR_YELLOW}Error: docker is not installed. Please install Docker first.${COLOR_NC}" >&2
        exit 1
    fi
    if ! [ -x "$(command -v docker-compose)" ] && ! docker compose version &>/dev/null; then
        echo -e "${COLOR_YELLOW}Error: docker-compose is not installed. Please install docker-compose first.${COLOR_NC}" >&2
        exit 1
    fi
}

# Use the appropriate command for docker compose
DOCKER_COMPOSE="docker-compose"
if docker compose version &>/dev/null; then
    DOCKER_COMPOSE="docker compose"
fi

case "$1" in
    # --- Docker Commands ---
    start)
        check_docker
        echo -e "${COLOR_BLUE}🚀 Starting DevOps Study Companion on Docker...${COLOR_NC}"
        $DOCKER_COMPOSE up -d --build
        echo -e "${COLOR_GREEN}✅ Services started successfully!${COLOR_NC}"
        echo -e "🔗 Frontend: ${COLOR_GREEN}http://localhost:3000${COLOR_NC}"
        echo -e "🔗 Backend API: ${COLOR_GREEN}http://localhost:5000/api/health${COLOR_NC}"
        ;;
    stop)
        check_docker
        echo -e "${COLOR_BLUE}🛑 Stopping Docker services...${COLOR_NC}"
        $DOCKER_COMPOSE down
        echo -e "${COLOR_GREEN}✅ Services stopped.${COLOR_NC}"
        ;;
    restart)
        check_docker
        echo -e "${COLOR_BLUE}🔄 Restarting Docker services...${COLOR_NC}"
        $DOCKER_COMPOSE down
        $DOCKER_COMPOSE up -d --build
        echo -e "${COLOR_GREEN}✅ Services restarted.${COLOR_NC}"
        ;;
    status)
        check_docker
        echo -e "${COLOR_BLUE}📊 Checking Docker service status...${COLOR_NC}"
        $DOCKER_COMPOSE ps
        ;;
    logs)
        check_docker
        echo -e "${COLOR_BLUE}📋 Following Docker logs (Ctrl+C to exit)...${COLOR_NC}"
        $DOCKER_COMPOSE logs -f
        ;;
    clean)
        check_docker
        echo -e "${COLOR_YELLOW}⚠️  Stopping Docker services and deleting data volumes...${COLOR_NC}"
        $DOCKER_COMPOSE down -v
        echo -e "${COLOR_GREEN}✅ Cleanup complete.${COLOR_NC}"
        ;;

    # --- Local Node/NPM Commands ---
    local-start)
        echo -e "${COLOR_BLUE}🚀 Starting DevOps Study Companion locally (No Docker)...${COLOR_NC}"
        
        # 1. Start Backend
        echo -e "${COLOR_BLUE}📦 Setting up Backend...${COLOR_NC}"
        cd backend
        if [ ! -d "node_modules" ]; then
            echo "Installing backend dependencies..."
            npm install
        fi
        echo "Starting backend server..."
        npm run dev > ../$BACKEND_LOG 2>&1 &
        echo $! > ../$BACKEND_PID_FILE
        cd ..
        
        # 2. Start Frontend
        echo -e "${COLOR_BLUE}📦 Setting up Frontend...${COLOR_NC}"
        cd frontend
        if [ ! -d "node_modules" ]; then
            echo "Installing frontend dependencies..."
            npm install
        fi
        echo "Starting frontend server..."
        npm run dev > ../$FRONTEND_LOG 2>&1 &
        echo $! > ../$FRONTEND_PID_FILE
        cd ..
        
        echo -e "${COLOR_GREEN}✅ Local processes started!${COLOR_NC}"
        echo -e "🔗 Frontend: ${COLOR_GREEN}http://localhost:3000${COLOR_NC}"
        echo -e "🔗 Backend API: ${COLOR_GREEN}http://localhost:5000/api/health${COLOR_NC}"
        echo -e "📋 Logs are written to: ${COLOR_YELLOW}$BACKEND_LOG${COLOR_NC} and ${COLOR_YELLOW}$FRONTEND_LOG${COLOR_NC}"
        ;;
    local-stop)
        echo -e "${COLOR_BLUE}🛑 Stopping local processes...${COLOR_NC}"
        if [ -f "$BACKEND_PID_FILE" ]; then
            BPID=$(cat "$BACKEND_PID_FILE")
            if ps -p $BPID > /dev/null; then
                pkill -P $BPID 2>/dev/null || true
                kill $BPID 2>/dev/null || true
                echo "Stopped backend process ($BPID)"
            else
                echo "Backend was not running."
            fi
            rm -f "$BACKEND_PID_FILE"
        else
            echo "Backend PID file not found."
        fi

        if [ -f "$FRONTEND_PID_FILE" ]; then
            FPID=$(cat "$FRONTEND_PID_FILE")
            if ps -p $FPID > /dev/null; then
                pkill -P $FPID 2>/dev/null || true
                kill $FPID 2>/dev/null || true
                echo "Stopped frontend process ($FPID)"
            else
                echo "Frontend was not running."
            fi
            rm -f "$FRONTEND_PID_FILE"
        else
            echo "Frontend PID file not found."
        fi
        echo -e "${COLOR_GREEN}✅ Local services stopped.${COLOR_NC}"
        ;;
    local-status)
        echo -e "${COLOR_BLUE}📊 Checking local processes...${COLOR_NC}"
        if [ -f "$BACKEND_PID_FILE" ]; then
            BPID=$(cat "$BACKEND_PID_FILE")
            if ps -p $BPID > /dev/null; then
                echo -e "Backend: ${COLOR_GREEN}RUNNING${COLOR_NC} (PID: $BPID)"
            else
                echo -e "Backend: ${COLOR_YELLOW}STOPPED${COLOR_NC}"
            fi
        else
            echo -e "Backend: ${COLOR_YELLOW}STOPPED${COLOR_NC}"
        fi

        if [ -f "$FRONTEND_PID_FILE" ]; then
            FPID=$(cat "$FRONTEND_PID_FILE")
            if ps -p $FPID > /dev/null; then
                echo -e "Frontend: ${COLOR_GREEN}RUNNING${COLOR_NC} (PID: $FPID)"
            else
                echo -e "Frontend: ${COLOR_YELLOW}STOPPED${COLOR_NC}"
            fi
        else
            echo -e "Frontend: ${COLOR_YELLOW}STOPPED${COLOR_NC}"
        fi
        ;;
    local-logs)
        echo -e "${COLOR_BLUE}📋 Following local logs (Ctrl+C to exit)...${COLOR_NC}"
        tail -f "$BACKEND_LOG" "$FRONTEND_LOG" 2>/dev/null || tail -f "$BACKEND_LOG" || tail -f "$FRONTEND_LOG"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
