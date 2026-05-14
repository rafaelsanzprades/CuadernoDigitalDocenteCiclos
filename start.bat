@echo off
echo ====================================================
echo   Iniciando Entorno de Desarrollo - Cuaderno Digital
echo ====================================================
echo.

echo [1/2] Levantando Backend (FastAPI) en puerto 8000...
start "Backend FastAPI" cmd /k "cd backend && ..\.venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo [2/2] Levantando Frontend (Next.js) en puerto 3000...
start "Frontend Next.js" cmd /k "cd frontend && npm run dev"

echo.
echo ¡Servidores lanzados en nuevas ventanas!
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000/docs
echo.
pause
