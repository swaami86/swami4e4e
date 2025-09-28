#!/bin/bash

# Cloudflare Workers-only deployment script
# This deploys just the API worker without building the React frontend

echo "🚀 Deploying Cloudflare Workers API..."

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

# Use the workers-only configuration
echo "📦 Deploying to production environment..."
wrangler deploy --config wrangler-workers-only.toml --env production

echo "✅ Deployment complete!"
echo "🌐 Your API is available at: https://ai-image-generator-api.YOURACCOUNT.workers.dev"
echo ""
echo "📊 Test your deployment:"
echo "curl https://ai-image-generator-api.YOURACCOUNT.workers.dev/health"