# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

### Database Configuration
```
MONGODB_URI=mongodb://localhost:27017/isamc-website
```

### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

### Email Configuration
```
SMTP_HOST=mail.isamc.in
SMTP_PORT=465
SMTP_SECURE=true
SENDER_EMAIL=info@isamc.in
SENDER_PASSWORD=your_cpanel_email_password
```

### Stripe Configuration (Optional - for payment features)
```
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

### Admin Configuration
```
ADMIN_EMAILS=admin@isamc.org,superadmin@isamc.org
```

### Server Configuration
```
PORT=5000
NODE_ENV=development
```

### CORS Configuration
```
FRONTEND_URL=http://localhost:5173
```

### Logging Configuration
```
LOG_LEVEL=info
```

## Quick Setup

1. Copy the variables above
2. Create a `.env` file in the backend directory
3. Paste and fill in your values
4. Restart the server

## Notes

- **Stripe keys are optional**: The app will work without them, but payment features will be disabled
- **JWT secrets**: Generate strong random strings for production
- **Email password**: Use app-specific passwords for Gmail
- **Admin emails**: Comma-separated list of admin email addresses

## Production

For production, make sure to:
- Use strong, unique JWT secrets
- Set NODE_ENV=production
- Use production Stripe keys
- Use a production MongoDB URI
- Set up proper email credentials 