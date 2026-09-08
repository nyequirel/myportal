@echo off
setlocal
cd /d "%~dp0"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if not exist "node_modules\express\package.json" (
  echo First-time setup: run npm.cmd install in this folder, then try again.
  pause
  exit /b 1
)
node scripts/start-local.mjs
if errorlevel 1 pause
endlocal
