# Script to create a coach user
# Usage: .\scripts\create-coach.ps1

$email = "clement@clementroy.work"
$password = "Coach123!"
$firstName = "Clement"
$lastName = "Coach"

$body = @{
    email = $email
    password = $password
    firstName = $firstName
    lastName = $lastName
    role = "coach"
    userType = "coach"
    plan = "coach"
} | ConvertTo-Json

Write-Host "Creating coach user: $email"
Write-Host "Note: This requires the server to be running and admin authentication"

# If you have an admin token, you can use it here
# $headers = @{
#     "Authorization" = "Bearer YOUR_ADMIN_TOKEN"
#     "Content-Type" = "application/json"
# }

# $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/users" -Method POST -Body $body -Headers $headers
# Write-Host "Response: $($response | ConvertTo-Json)"

Write-Host ""
Write-Host "To create the coach user, you can:"
Write-Host "1. Run: pnpm seed:coach (if node is available)"
Write-Host "2. Use Prisma Studio: pnpm db:studio"
Write-Host "3. Use the admin panel to create a user and then change role to coach"
Write-Host "4. Use the API POST endpoint: /api/admin/users with admin authentication"

