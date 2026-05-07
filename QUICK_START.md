# Quick Start Guide - Authentication Setup

## 1. Install Dependencies
```bash
npm install
```

## 2. Get OAuth Credentials

### Google OAuth
1. Go to https://console.cloud.google.com/
2. Create new project → "HyperWeather"
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (type: Web application)
5. Add to Authorized JavaScript origins: `http://localhost:5173`
6. Copy your **Client ID**

### Facebook OAuth
1. Go to https://developers.facebook.com/
2. My Apps → Create App
3. Choose "Consumer"
4. Find Facebook Login and set it up
5. Go to Settings → Basic
6. Copy your **App ID**

## 3. Create `.env` File
Create a `.env` file in your project root:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

Replace the values with your actual credentials.

## 4. Run the App
```bash
npm run dev
```

Visit `http://localhost:5173` and you'll see the login page!

## 5. Test Login
- Click "Sign in with Google" or "Sign in with Facebook"
- Or create an account with email/password
- You should be redirected to the home page with your profile visible

## Files to Know About
- `AUTHENTICATION_SUMMARY.md` - Complete feature list and implementation details
- `SETUP_GUIDE.md` - Detailed step-by-step setup instructions
- `src/context/AuthContext.jsx` - Authentication logic
- `src/pages/Login.jsx` - Login page
- `src/pages/SignUp.jsx` - Sign-up page

## Need Help?
Check the `SETUP_GUIDE.md` file for detailed troubleshooting and more information.
