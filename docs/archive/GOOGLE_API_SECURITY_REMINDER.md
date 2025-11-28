# Google API Key Security Reminder

## HTTP Referrer Restrictions (Critical Security Step)

To ensure maximum security for the Google API key (AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM), you MUST set up HTTP referrer restrictions in the Google Cloud Console:

### Steps to Set Up HTTP Referrer Restrictions:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Find the API key: AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM
4. Click on the pencil icon to edit the key
5. Under "Application restrictions", select "HTTP referrers (websites)"
6. In the "Website restrictions" field, add:
   - `https://axiomid.app/*`
   - `http://localhost:*/*` (for local development)
7. Click "Save"

### Why This Is Important:

This restriction ensures that even if the API key is somehow exposed, it can only be used from your authorized domains:
- Production: `https://axiomid.app/*`
- Development: `http://localhost:*/*`

Any attempts to use the key from other domains will be rejected by Google's servers.

## Secure Storage Guidelines

### Local Development:
- API key is stored in `.env` file
- `.env` file is excluded from Git via `.gitignore`
- Never commit `.env` file to repository

### Production Deployment:
- API key is stored as Environment Variable in Render.com
- Never hardcode API keys in source code
- Use proper secret management in deployment environments

## Security Best Practices

1. **Regular Rotation**: Rotate API keys periodically
2. **Monitoring**: Monitor API key usage in Google Cloud Console
3. **Least Privilege**: Restrict API key to only necessary APIs
4. **Audit**: Regularly audit who has access to the API key