# Deploying SAARTHI Backend to Render

This guide will walk you through deploying the SAARTHI backend to Render.

## Prerequisites

1. A [Render](https://render.com/) account
2. Your project code in a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Connect Your Repository to Render

1. Log in to your Render account
2. Click on the "New +" button and select "Web Service"
3. Connect to your Git repository where the SAARTHI backend code is hosted
4. Select the repository and branch you want to deploy

### 2. Configure Your Web Service

Enter the following settings:

- **Name**: saarthi-backend (or your preferred name)
- **Environment**: Python
- **Region**: Choose the closest to your users
- **Branch**: main (or your preferred branch)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

### 3. Set Environment Variables

Add the following environment variables:

- `MONGODB_URI`: Your MongoDB connection string (e.g., MongoDB Atlas)
- `JWT_SECRET_KEY`: A secure random string (or let Render generate one)
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER`: Your Twilio Phone Number
- `FRONTEND_URLS`: Comma-separated list of allowed frontend URLs (e.g., https://your-frontend-app.render.com,https://saarthi.vercel.app)

### 4. Deploy Your Service

Click "Create Web Service" to deploy your application.

Render will automatically build and deploy your application based on the configuration provided.

### 5. Update Your Frontend Configuration

Update your frontend application to use the new backend URL:

```javascript
// Example API configuration in your frontend
const API_BASE_URL = 'https://your-backend-name.onrender.com';
```

## Troubleshooting

- **Deployment Failures**: Check the build logs in Render for specific errors
- **CORS Issues**: Make sure you've correctly set the `FRONTEND_URLS` environment variable
- **Database Connection Issues**: Verify your MongoDB connection string and ensure your IP is whitelisted

## Monitoring

Render provides logs and metrics for your application. Check the "Logs" tab to see your application logs and debug any issues.
