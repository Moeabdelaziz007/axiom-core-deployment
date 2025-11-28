# Google Cloud Setup Instructions

## Prerequisites

Before running the setup script, you need to:

1. Install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Install Node.js and npm (for Wrangler): https://nodejs.org/
3. Install Wrangler globally: `npm install -g wrangler`

## Setup Script

The setup script (`scripts/setup-google-cloud.sh`) automates the following tasks:

### 1. Project Configuration
- Prompts for your Google Cloud Project ID
- Sets the project in gcloud configuration

### 2. API Enablement
- Enables these Google Cloud APIs:
  - BigQuery API (`bigquery.googleapis.com`)
  - Cloud Translation API (`translate.googleapis.com`)
  - Speech-to-Text API (`speech.googleapis.com`)
  - Text-to-Speech API (`texttospeech.googleapis.com`)

### 3. Service Account Creation
- Creates a service account named `axiom-agent-sa`
- Grants these roles:
  - BigQuery Admin (`roles/bigquery.admin`)
  - Cloud Translation User (`roles/cloudtranslate.user`)

### 4. Key Generation
- Generates a service account JSON key
- Attempts to create an API key for Translation/Speech services

### 5. Cloudflare Secret Upload
- Uploads the service account key as `FIREBASE_SERVICE_ACCOUNT_JSON`
- Uploads the project ID as `GOOGLE_CLOUD_PROJECT_ID`
- Uploads the API key as `GOOGLE_TRANSLATE_API_KEY` (if available)

### 6. Cleanup
- Securely deletes the temporary JSON key file

## Running the Script

1. Make sure you're logged into gcloud:
   ```bash
   gcloud auth login
   ```

2. Run the setup script:
   ```bash
   cd axiom-stack
   ./scripts/setup-google-cloud.sh
   ```

3. Follow the prompts to complete the setup

## Manual Steps (if needed)

If the script cannot automatically create an API key, you'll need to:

1. Go to https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" > "API key"
3. Copy the generated key
4. Upload it to Cloudflare:
   ```bash
   echo "YOUR_API_KEY" | wrangler secret put GOOGLE_TRANSLATE_API_KEY --name axiom-tool-executor
   ```

## Verification

After running the script, you can verify the setup by:

1. Checking that the APIs are enabled:
   ```bash
   gcloud services list --enabled
   ```

2. Verifying the service account exists:
   ```bash
   gcloud iam service-accounts list
   ```

3. Confirming the secrets are in Cloudflare:
   ```bash
   wrangler secret list --name axiom-tool-executor
   ```