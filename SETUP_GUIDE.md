# Authentication Setup Guide

This guide will help you configure Google and Facebook OAuth authentication for the HyperWeather application.

## Prerequisites

- Node.js 16+ installed
- Google account
- Facebook account
- A code editor (VS Code recommended)

## Step 1: Install Dependencies

First, install the required packages:

```bash
npm install
```

This will install the OAuth packages that were added to your `package.json`:
- `@react-oauth/google` - Google OAuth integration
- `react-facebook-login` - Facebook OAuth integration

## Step 2: Google OAuth Setup

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter a project name (e.g., "HyperWeather") and click "Create"
4. Wait for the project to be created

### 2.2 Create OAuth 2.0 Credentials

1. In the Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Click "Configure Consent Screen"
   - Choose "External" for User Type
   - Fill in the required fields:
     - App name: "HyperWeather"
     - Support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue" through the other screens

4. Back to OAuth client ID creation:
   - Application type: **Web application**
   - Name: "HyperWeather Web"
   - Add Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (if using different port)
     - Your production domain (when deploying)
   - Add Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain (when deploying)
   - Click "Create"

5. Copy your **Client ID** from the modal that appears

### 2.3 Add Google Client ID to Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`):

```bash
cp .env.example .env
```

2. Open `.env` and replace the placeholder with your Google Client ID:

```
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here.apps.googleusercontent.com
```

## Step 3: Facebook OAuth Setup

### 3.1 Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/docs/)
2. Click "My Apps" > "Create App"
3. Choose app type: "Consumer" > "Next"
4. Fill in the app details:
   - App Name: "HyperWeather"
   - App Contact Email: Your email
   - App Purpose: Select appropriate category
5. Complete security check and create the app

### 3.2 Configure Facebook Login

1. From your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web"
4. Go to **Settings** > **Basic**
5. Copy your **App ID**
6. In **Settings** > **Basic**, add the following:
   - App Domains: `localhost:5173` (for development)
   - App Domain: `localhost` (for development)

7. Go to **Facebook Login** > **Settings**
8. Add Valid OAuth Redirect URIs:
   - `http://localhost:5173/` (for development)
   - Your production URL (when deploying)

### 3.3 Add Facebook App ID to Environment Variables

1. Open `.env` file and update:

```
VITE_FACEBOOK_APP_ID=your_actual_facebook_app_id_here
```

## Step 4: Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

When you access the site, you'll be redirected to the login page where you can:
- Sign in with Google
- Sign in with Facebook
- Use email/password (basic example)

## Step 5: Test Authentication

1. Open your browser to `http://localhost:5173`
2. You should see the Login page
3. Click "Sign in with Google" or "Sign in with Facebook"
4. Complete the OAuth flow
5. You should be redirected to the Home page and see your profile in the navbar

## Troubleshooting

### Google OAuth Issues

- **"Unauthorized origin" error**: Make sure `http://localhost:5173` is in your Authorized JavaScript origins in Google Cloud Console
- **"Invalid client" error**: Verify your Client ID is correct in `.env` file
- **Refresh token issues**: Google limits refresh tokens per user/app. Clear localStorage and try again.

### Facebook OAuth Issues

- **"App not set up" error**: Ensure you've added `localhost` to your App Domains
- **CORS errors**: Check that your Valid OAuth Redirect URIs include `http://localhost:5173/`
- **"Misconfigured" error**: Verify your App ID in `.env` is correct

### General Issues

- **Port conflicts**: If 5173 is already in use, Vite will automatically use the next available port (check terminal output)
- **Module not found**: Run `npm install` again to ensure all packages are installed
- **Clear cache**: Delete `.env.local` and clear browser localStorage if you change credentials

## Environment Variables Summary

Create a `.env` file with these variables:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Facebook OAuth Configuration
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

## Production Deployment

When deploying to production:

1. Update your OAuth credentials to include your production domain
2. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
3. Update redirect URIs to your production domain
4. Never commit `.env` file to version control

## File Structure

The authentication system uses:

```
src/
├── context/
│   └── AuthContext.jsx          # Authentication state management
├── pages/
│   ├── Login.jsx                 # Login page component
│   └── Login.css                 # Login page styles
├── components/
│   ├── Navbar.jsx                # Updated with user profile
│   └── Navbar.css                # User section styles
└── App.jsx                        # Updated with auth routes and protection
```

## Key Features

✅ Google OAuth 2.0 integration
✅ Facebook OAuth integration
✅ Protected routes (redirect to login if not authenticated)
✅ User session persistence (localStorage)
✅ Automatic logout functionality
✅ User profile display in navbar
✅ Responsive design for mobile/tablet

## Next Steps

1. Customize the login page styling to match your brand
2. Add email/password authentication backend
3. Implement user database to store user information
4. Add social profile API calls for additional user data
5. Implement proper session management with backend JWT tokens
