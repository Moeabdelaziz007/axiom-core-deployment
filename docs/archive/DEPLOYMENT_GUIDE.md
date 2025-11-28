# Axiom ID Backend Deployment Guide

## 🚀 Current Status

We have successfully prepared our backend for deployment with the following components:

1. **Socket.io Server** - Real-time communication layer for the Holo-Core AI partner
2. **AgentSDKFactory** - The "hands" of our AI agent that can generate custom SDKs
3. **Render Deployment Configuration** - Ready for one-click deployment to Render.com

## 🔐 Security Update

We've fixed a security issue where the Google API key was exposed in the repository. The key has been removed and replaced with a placeholder. You'll need to generate a new API key and add it as an environment variable.

## 📋 What We've Accomplished

### ✅ Backend Components
- **HoloCoreVisual** - 3D holographic visualization (frontend)
- **Voice Recognition** - Speech-to-text with wake word detection (frontend)
- **Socket.io Server** - Real-time communication layer (backend)
- **AgentSDKFactory** - SDK generation capability (backend)
- **AxiomOrchestrator** - AI decision-making engine (backend)

### ✅ Deployment Preparation
- Updated `render.yaml` with Socket.io server configuration
- Added deployment test script
- Verified all environment variables are properly configured
- Confirmed Git repository is connected to GitHub

## 🚢 Deployment Steps

### 1. Commit and Push Changes
```bash
cd /Users/cryptojoker710/Desktop/Axiom\ ID/axiom-stack/packages/bots/axiom-assist-bot
git add .
git commit -m "Add Socket.io server deployment configuration"
git push origin main
```

### 2. Connect to Render.com
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the branch (main)
5. Render will automatically detect and use our `render.yaml` configuration

### 3. Configure Environment Variables
In Render.com dashboard, add the following environment variables:
- `GEMINI_API_KEY` - Your new Google Gemini API key (see GOOGLE_API_KEY_INSTRUCTIONS.md)
- `PINECONE_API_KEY` - Your Pinecone API key
- `SOCKET_PORT` - 3001 (or your preferred port)

### 4. Set Up Custom Domain (axiomid.app)
1. In Render.com dashboard, go to your service settings
2. Click "Custom domains"
3. Add your domain: `axiomid.app`
4. Follow Render's instructions to configure DNS records
5. Update your frontend to use the custom domain instead of the default Render subdomain

### 5. Deploy
Render will automatically deploy your service. Your Socket.io server will be available at:
`https://axiomid.app`

## 🔌 Frontend Integration

Once deployed with the custom domain, update your frontend to connect to the live Socket.io server:

```javascript
// In your HoloCoreWidget component
const socket = io('https://axiomid.app');
```

## 🧪 Testing Deployment

Run our deployment test script to verify everything is configured correctly:

```bash
cd /Users/cryptojoker710/Desktop/Axiom\ ID/axiom-stack/packages/bots/axiom-assist-bot
npm run test:deployment
```

## 🎯 Next Steps

1. Deploy to Render.com
2. Set up custom domain (axiomid.app)
3. Update frontend to use custom domain URL
4. Test end-to-end integration
5. Share live URL with Kimi.com team for frontend integration

## 📞 Support

For any deployment issues, contact the team with:
- Render.com service logs
- Error messages from deployment
- Git commit hash of deployed version