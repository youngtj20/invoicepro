Set-Location "c:\Users\talk2\OneDrive\Desktop\invoice saas\invoice-saas"
npx prisma db push --skip-generate
Write-Host "Migration applied successfully!"
Read-Host "Press Enter to exit"
