@echo off
echo ========================================
echo   STGCN Traffic Prediction System
echo   Starting servers...
echo ========================================
echo.

echo [1/2] Starting Flask backend...
start "STGCN Backend" cmd /k "python app.py"

timeout /t 5 /nobreak >nul

echo [2/2] Starting React frontend...
start "STGCN Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servers started!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
