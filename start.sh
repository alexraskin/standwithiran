#!/bin/sh

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --migrate    Run migrations before starting"
    echo "  -h, --help       Show this help message"
    exit 0
}

RUN_MIGRATE=false

while [ $# -gt 0 ]; do
    case "$1" in
        -m|--migrate)
            RUN_MIGRATE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

if [ "$RUN_MIGRATE" = true ]; then
    echo "Running migrations..."
    docker compose --profile migrate up migrate --build --remove-orphans
fi

echo "Starting app..."
docker compose up --build --remove-orphans
