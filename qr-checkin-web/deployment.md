# Production Deployment Configuration

## Environment Variables
In production, you'll need to set the following environment variables:

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

# Database Configuration
DATABASE_URL=your-database-url
```

## Production Build
To build the application for production, run:

```bash
cd /home/ubuntu/qr-checkin-app/qr-checkin-web
pnpm build
```

## Cloudflare Deployment
This application is configured to deploy to Cloudflare Pages and Workers, which provides:
- Global CDN for static assets
- Serverless functions for API endpoints
- D1 database for data storage

### Deployment Steps
1. Configure Cloudflare account and create a D1 database
2. Update wrangler.toml with production database binding
3. Deploy using Cloudflare Wrangler:
   ```bash
   pnpm wrangler deploy
   ```

## Alternative Deployment Options

### Traditional Web Hosting
1. Build the application
2. Set up a Node.js server environment
3. Configure a production database (PostgreSQL recommended)
4. Set up HTTPS with a valid SSL certificate
5. Configure environment variables
6. Use PM2 or similar for process management

### Docker Deployment
1. Create a Dockerfile in the project root
2. Build the Docker image
3. Push to a container registry
4. Deploy to your container orchestration platform

## Mobile App Deployment
For the mobile app component:
1. Use React Native to build native apps from the same codebase
2. Deploy to Apple App Store and Google Play Store
3. Configure mobile app to communicate with the same backend API
