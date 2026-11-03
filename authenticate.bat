@echo off
title Cap quyen Day Du (Ghi/Tao File) Google Workspace cho Antigravity
color 0A
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "d:\Booking"
echo ============================================================
echo   DANG KHOI DONG CAP QUYEN GHI/TAO FILE GOOGLE DRIVE & DOCS
echo   Trinh duyet se tu dong mo len de ban xac nhan.
echo ============================================================
echo.
node src/auth_full.cjs
echo.
pause
