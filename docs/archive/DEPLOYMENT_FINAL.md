# Final Deployment Instructions for Axiom ID Domain Setup

## Overview
This document provides step-by-step instructions for setting up the domain configuration where:
- The landing page is served from the main domain: https://axiomid.app
- The bot API is served from the subdomain: https://api.axiomid.app

## Manual Steps Required

### 1. Configure Custom Domain on Render
1. Go to Render.com
2. Select the `axiom-id-socket-server` service
3. Navigate to "Settings" → "Custom Domains"
4. Add `api.axiomid.app` as a custom domain
5. Follow the DNS verification instructions provided by Render

### 2. Update DNS Records
1. Access your domain provider's DNS management (Namecheap, GoDaddy, etc.)
2. Add a new CNAME record:
   - Name/Host: `api`
   - Value/Points to: The target domain provided by Render (typically something like `your-service.onrender.com`)
   - TTL: 300 (or default)

### 3. Verify Configuration
1. Wait for DNS propagation (5-30 minutes)
2. Test the connection by visiting https://api.axiomid.app/health
3. Verify that the frontend (served from https://axiomid.app) can connect to the backend via the api.axiomid.app subdomain

### 4. Update Environment Variables (if needed)
1. In your Render service settings, ensure the following environment variables are set:
   - `SOCKET_SERVER_URL` = `https://api.axiomid.app`
   - Any other relevant environment variables for your application

## Troubleshooting
- If the connection fails, check that the CORS settings in your backend allow requests from https://axiomid.app
- Ensure that all SSL certificates are properly configured for both the main domain and subdomain
- Verify that the CNAME record has propagated using a DNS lookup tool