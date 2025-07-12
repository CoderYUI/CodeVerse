# MongoDB Atlas Connection Fix for Render Deployment

## Issue
The application on Render was trying to connect to a local MongoDB instance (`localhost:27017`) instead of the MongoDB Atlas cluster. This was causing 500 errors when trying to register or login.

## Fix
1. Update the MongoDB URI environment variable on Render:
   - Go to the Render dashboard
   - Select your backend service
   - Click on "Environment"
   - Add or update the `MONGODB_URI` variable to:
     ```
     mongodb+srv://yui:me@nyayacop.f9dkeuw.mongodb.net/saarthi
     ```
   - Save changes and redeploy

2. Also add the `FRONTEND_URLS` variable to fix CORS:
   ```
   https://code-verse-snowy.vercel.app,http://localhost:5173,http://127.0.0.1:5173
   ```

3. Verify MongoDB Atlas Connection:
   - Make sure your MongoDB Atlas cluster is configured to accept connections from anywhere (or at least from Render's IP ranges)
   - Check that the database user has the proper permissions

## Testing the Fix
After deploying the changes:
1. Try to register a new police user
2. Check the Render logs for any database connection issues
3. Verify that registration requests return a 200 status instead of 500

## Troubleshooting
If issues persist:
1. Check Render logs for detailed error messages
2. Verify that your MongoDB Atlas credentials are correct
3. Make sure the IP whitelist in MongoDB Atlas includes Render's IP address (or set it to allow access from anywhere)
