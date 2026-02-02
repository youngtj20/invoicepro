@echo off
REM Fix Migration Error Script
REM This script fixes the partial migration issue

echo ========================================
echo Fix Migration Error
echo ========================================
echo.

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set!
    echo.
    echo Please set it first:
    echo   set DATABASE_URL=mysql://user:password@host:3306/database
    echo.
    pause
    exit /b 1
)

echo Current DATABASE_URL: %DATABASE_URL%
echo.
echo This script will:
echo 1. Mark the failed migration as rolled back
echo 2. Reset the database (DROP ALL TABLES)
echo 3. Reapply all migrations from scratch
echo.
echo WARNING: This will DELETE ALL DATA in the database!
echo.
set /p CONFIRM="Type 'YES' (in capitals) to continue: "

if not "%CONFIRM%"=="YES" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo Step 1: Marking failed migration as rolled back...
call npx prisma migrate resolve --rolled-back 20251127183028_add_description_to_tax
if errorlevel 1 (
    echo Note: Migration may already be marked as rolled back
)

echo.
echo Step 2: Resetting database...
call npx prisma migrate reset --force --skip-seed
if errorlevel 1 (
    echo ERROR: Database reset failed
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying all migrations...
call npx prisma migrate deploy
if errorlevel 1 (
    echo ERROR: Migration deployment failed
    pause
    exit /b 1
)

echo.
echo Step 4: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma Client
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Database has been reset and all migrations applied
echo ========================================
echo.
echo Your database is now ready to use.
echo All tables have been created successfully.
echo.

pause
