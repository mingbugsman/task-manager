# TASK MANAGER

## Cấu trúc
- `backend/` — Spring Boot API (port 8080)
- `frontend/` — Next.js web app (port 3000)  
- `desktop/` — Tauri desktop app (wrap frontend)

## Chạy local

### Chạy tất cả bằng Docker
docker compose up

### Chạy backend riêng
cd backend && mvn spring-boot:run

### Chạy frontend riêng
cd frontend && npm install && npm run dev

### Chạy desktop app
cd frontend && npm run build
cd desktop && npm run tauri dev