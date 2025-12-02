# Axiom ID - Environment Configuration Deployment Guide

## 🚨 Critical Missing Environment Variables

The following environment variables are **REQUIRED** for production deployment but are currently missing from your `.env.local` file:

### 1. Vector Database (Pinecone) - Required for AI Memory Features
```bash
# Get your API key from: https://app.pinecone.io/
PINECONE_API_KEY=your-pinecone-api-key-here

# Find this in your Pinecone project settings
PINECONE_ENVIRONMENT=your-pinecone-environment-here
```

### 2. Security (Arcjet) - Required for Rate Limiting & Protection
```bash
# Get your key from: https://arcjet.com/
ARCJET_KEY=your-arcjet-key-here
```

### 3. Authentication - Required for User Sessions
```bash
# Generate a strong secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here

# Should be your deployed application URL
NEXTAUTH_URL=https://your-domain.com
```

## 📋 Complete Environment Setup Checklist

### ✅ Currently Configured
- [x] `GOOGLE_API_KEY` - Google Generative AI
- [x] `GROQ_API_KEY` - Groq LLM Services  
- [x] `TURSO_DATABASE_URL` - Turso Database
- [x] `TURSO_AUTH_TOKEN` - Turso Authentication

### ❌ Missing (Critical for Production)
- [ ] `PINECONE_API_KEY` - Vector Database for AI Memory
- [ ] `PINECONE_ENVIRONMENT` - Pinecone Project Environment
- [ ] `ARCJET_KEY` - Security & Rate Limiting
- [ ] `NEXTAUTH_SECRET` - Authentication Security
- [ ] `NEXTAUTH_URL` - Authentication Domain

### ⚠️ Optional but Recommended
- [ ] `VERCEL_AI_KEY` - Vercel AI Gateway Pro Features
- [ ] `UPSTASH_REDIS_REST_URL` - Redis Caching
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis Authentication
- [ ] `AXIOM_INGEST_URL` - Monitoring & Analytics
- [ ] `AXIOM_DATASET_NAME` - Monitoring Dataset

## 🔧 Setup Instructions

### 1. Get Pinecone Credentials
1. Visit https://app.pinecone.io/
2. Create a new project or use existing one
3. Generate an API key
4. Copy the API key and environment name to your `.env.local`

### 2. Get Arcjet Security Key
1. Visit https://arcjet.com/
2. Sign up and create a new project
3. Generate an API key
4. Add to your `.env.local` file

### 3. Generate NextAuth Secret
```bash
# Generate a secure random secret
openssl rand -base64 32
```

### 4. Update Production URL
```bash
# For production deployment
NEXTAUTH_URL=https://your-vercel-app-domain.vercel.app

# For local development
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Deployment Verification

After configuring all environment variables:

1. **Test Local Build:**
   ```bash
   cd packages/web-ui
   npm run build
   ```

2. **Verify Environment Loading:**
   ```bash
   # Check if all required variables are loaded
   npm run dev
   # Look for any missing variable warnings in console
   ```

3. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy with environment variables
   vercel --prod
   ```

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Issue: "PINECONE_API_KEY is not defined"
**Solution:** Add Pinecone credentials to environment variables

#### Issue: "Arcjet key missing"  
**Solution:** Configure ARCJET_KEY in environment

#### Issue: "NextAuth secret not configured"
**Solution:** Generate and add NEXTAUTH_SECRET

#### Issue: Build fails with TypeScript errors
**Solution:** All TypeScript issues have been resolved in the latest fixes

## 📞 Support Resources

- **Pinecone Documentation:** https://docs.pinecone.io/
- **Arcjet Documentation:** https://docs.arcjet.com/
- **NextAuth Documentation:** https://next-auth.js.org/
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables/

## ⚡ Quick Setup Script

Copy and run this script to quickly add missing variables:

```bash
# Create a secure NextAuth secret
AUTH_SECRET=$(openssl rand -base64 32)

# Add to your .env.local
cat >> packages/web-ui/.env.local << EOF

# Vector Database Configuration
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=your-pinecone-environment

# Security Configuration  
ARCJET_KEY=your-arcjet-key-here

# Authentication Configuration
NEXTAUTH_SECRET=$AUTH_SECRET
NEXTAUTH_URL=https://your-domain.com
EOF

echo "✅ Environment variables template added to .env.local"
echo "🔧 Please replace placeholder values with actual credentials"
```

---

**⚠️ Security Reminder:** Never commit `.env.local` to version control. Always use secure methods to share credentials in production environments.