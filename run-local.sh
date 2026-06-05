#!/bin/bash

# DevOps Study Companion Local Runner Script
# Usage: ./run-local.sh [start|stop|restart|status|logs|clean]

set -e

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_NC='\033[0m' # No Color

function show_usage() {
    echo -e "${COLOR_YELLOW}Usage:${COLOR_NC}"
    echo "  $0 start    - Start all services (MongoDB, Backend, Frontend) in the background"
    echo "  $0 stop     - Stop all services"
    echo "  $0 restart  - Rebuild and restart all services"
    echo "  $0 status   - Show current running status of services"
    echo "  $0 logs     - View and follow logs of the running services"
    echo "  $0 clean    - Stop services and remove all data volumes"
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
    start)
        check_docker
        echo -e "${COLOR_BLUE}🚀 Starting DevOps Study Companion on localhost...${COLOR_NC}"
        $DOCKER_COMPOSE up -d --build
        echo -e "${COLOR_GREEN}✅ Services started successfully!${COLOR_NC}"
        echo -e "🔗 Frontend: ${COLOR_GREEN}http://localhost:3000${COLOR_NC}"
        echo -e "🔗 Backend API: ${COLOR_GREEN}http://localhost:5000/api/health${COLOR_NC}"
        ;;
    stop)
        check_docker
        echo -e "${COLOR_BLUE}🛑 Stopping services...${COLOR_NC}"
        $DOCKER_COMPOSE down
        echo -e "${COLOR_GREEN}✅ Services stopped.${COLOR_NC}"
        ;;
    restart)
        check_docker
        echo -e "${COLOR_BLUE}🔄 Restarting services...${COLOR_NC}"
        $DOCKER_COMPOSE down
        $DOCKER_COMPOSE up -d --build
        echo -e "${COLOR_GREEN}✅ Services restarted.${COLOR_NC}"
        ;;
    status)
        check_docker
        echo -e "${COLOR_BLUE}📊 Checking service status...${COLOR_NC}"
        $DOCKER_COMPOSE ps
        ;;
    logs)
        check_docker
        echo -e "${COLOR_BLUE}📋 Following logs (Ctrl+C to exit)...${COLOR_NC}"
        $DOCKER_COMPOSE logs -f
        ;;
    clean)
        check_docker
        echo -e "${COLOR_YELLOW}⚠️  Stopping services and deleting data volumes...${COLOR_NC}"
        $DOCKER_COMPOSE down -v
        echo -e "${COLOR_GREEN}✅ Cleanup complete.${COLOR_NC}"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
