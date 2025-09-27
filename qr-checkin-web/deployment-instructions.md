# Deployment Instructions for QR Code Check-in Application

## Prerequisites
- Cloudflare account with Workers and Pages enabled
- QuickBooks Online account with API access
- SMTP server for sending emails
- Node.js and pnpm installed on deployment machine

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/qr-checkin-app.git
cd qr-checkin-app/qr-checkin-web
```

### 2. Configure Environment Variables
Create a `.env` file in the project root with the following variables:
```
# QuickBooks API Configuration
QB_CONSUMER_KEY=your-consumer-key
QB_CONSUMER_SECRET=your-consumer-secret
QB_TOKEN=your-token
QB_TOKEN_SECRET=your-token-secret
QB_REALM_ID=your-realm-id
QB_SANDBOX=false

# Email Configuration
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Configure Cloudflare
1. Create a D1 database in your Cloudflare account
2. Update the `wrangler.toml` file with your database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "qr-checkin-db"
database_id = "your-database-id-from-cloudflare"
```

## Deployment Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Tests
```bash
pnpm test
```

### 3. Build the Application
```bash
pnpm build
```

### 4. Initialize Database
```bash
pnpm wrangler d1 execute DB --file=migrations/0001_initial.sql
```

### 5. Deploy to Cloudflare
```bash
pnpm wrangler deploy
```

### 6. Verify Deployment
1. Check the deployment URL provided by Cloudflare
2. Test the admin login with the default credentials:
   - Email: admin@example.com
   - Password: admin123
3. Change the default password immediately

## Automated Deployment

For automated deployment, use the included deploy script:
```bash
./deploy.sh
```

## Post-Deployment Tasks

1. Set up custom domain in Cloudflare Pages
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Create additional admin users
5. Configure backup schedule for the database

## Mobile App Deployment (Future)

For the mobile application component:
1. Build the React Native app using the shared codebase
2. Deploy to Apple App Store and Google Play Store
3. Configure the mobile app to use the production API endpoints

## Troubleshooting

- If database migrations fail, check the Cloudflare Workers logs
- If QuickBooks integration fails, verify API credentials and permissions
- For email delivery issues, check SMTP configuration and server status

## Maintenance

- Regularly update dependencies using `pnpm update`
- Monitor QuickBooks API for any changes or deprecations
- Perform regular database backups
- Check application logs for errors or performance issues
