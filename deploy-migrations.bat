@echo off
REM Production Database Migration Script
REM This script deploys Prisma migrations to your production database

echo ========================================
echo Production Database Migration
echo ========================================
echo.

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set!
    echo.
    echo Please set it first:
    echo   set DATABASE_URL=mysql://user:password@host:3306/database
    echo.
    echo Or create a .env.production file with your production DATABASE_URL
    echo.
    pause
    exit /b 1
)

echo Current DATABASE_URL: %DATABASE_URL%
echo.
echo WARNING: This will run migrations on the above database.
echo Make sure this is your PRODUCTION database!
echo.
set /p CONFIRM="Type 'yes' to continue: "

if /i not "%CONFIRM%"=="yes" (
    echo Migration cancelled.
    pause
    exit /b 0
)

echo.
echo Step 1: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma Client
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying migrations...
call npx prisma migrate deploy
if errorlevel 1 (
    echo ERROR: Migration deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Migrations deployed successfully
echo ========================================
echo.
echo Your production database now has all required tables.
echo You can now restart your application.
echo.

pause
