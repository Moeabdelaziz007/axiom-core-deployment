# Instructions to Generate a New Google API Key

## Why This Is Necessary
Your previous Google API key was exposed in the code repository. For security reasons, it's important to:
1. Generate a new API key
2. Delete the old exposed key
3. Update your environment with the new key

## Steps to Generate a New Google API Key

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select or create a project for your Axiom ID application

### 2. Enable Required APIs
1. In the left sidebar, click "APIs & Services" → "Library"
2. Search for and enable:
   - "Generative Language API" (for Gemini)
   - Any other APIs your application uses

### 3. Create New API Key
1. In the left sidebar, click "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key and save it in a secure location
4. Click "Close"

### 4. Restrict the API Key (Recommended for Security)
1. Click on the newly created API key in the credentials list
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Add your domain(s) in the "Website restrictions" section:
   - `http://localhost:*/*`
   - `https://axiomid.app/*`
   - Any other domains where your app will be hosted
4. Under "API restrictions", select "Restrict key"
5. Check the boxes for the APIs you want to enable:
   - "Generative Language API"
6. Click "Save"

### 5. Delete the Old Exposed Key
1. Find the old API key in the credentials list (the one that was exposed)
2. Click on it and then click "Delete API key"
3. Confirm deletion

### 6. Update Your Environment
1. Update your local .env file with the new API key:
   ```
   GEMINI_API_KEY=your_new_api_key_here
   ```
2. Update the environment variables in your Render.com deployment

## Security Best Practices
- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate API keys periodically
- Restrict API keys to only the necessary APIs and domains
- Monitor API key usage in the Google Cloud Console