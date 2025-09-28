#!/bin/bash

# Multi-Account Cloudflare Deployment Script  
# This script deploys your API to 10 different Cloudflare accounts

echo "🚀 Starting multi-account deployment..."

# Account 1 deployment
echo "📦 Deploying to Account 1..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_1_TOKEN"
npx wrangler deploy --env account1 --compatibility-date 2024-08-24

# Account 2 deployment  
echo "📦 Deploying to Account 2..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_2_TOKEN"
npx wrangler deploy --env account2 --compatibility-date 2024-08-24

# Account 3 deployment
echo "📦 Deploying to Account 3..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_3_TOKEN"
npx wrangler deploy --env account3 --compatibility-date 2024-08-24

# Account 4 deployment
echo "📦 Deploying to Account 4..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_4_TOKEN"
npx wrangler deploy --env account4 --compatibility-date 2024-08-24

# Account 5 deployment
echo "📦 Deploying to Account 5..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_5_TOKEN"
npx wrangler deploy --env account5 --compatibility-date 2024-08-24

# Account 6 deployment
echo "📦 Deploying to Account 6..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_6_TOKEN"
npx wrangler deploy --env account6 --compatibility-date 2024-08-24

# Account 7 deployment
echo "📦 Deploying to Account 7..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_7_TOKEN"
npx wrangler deploy --env account7 --compatibility-date 2024-08-24

# Account 8 deployment
echo "📦 Deploying to Account 8..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_8_TOKEN"
npx wrangler deploy --env account8 --compatibility-date 2024-08-24

# Account 9 deployment
echo "📦 Deploying to Account 9..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_9_TOKEN"
npx wrangler deploy --env account9 --compatibility-date 2024-08-24

# Account 10 deployment
echo "📦 Deploying to Account 10..."
export CLOUDFLARE_API_TOKEN="YOUR_ACCOUNT_10_TOKEN"
npx wrangler deploy --env account10 --compatibility-date 2024-08-24

# Main load balancer deployment
echo "📦 Deploying main load balancer..."
export CLOUDFLARE_API_TOKEN="YOUR_MAIN_ACCOUNT_TOKEN"
npx wrangler deploy --env production --compatibility-date 2024-08-24

echo "✅ All deployments completed!"
echo "🌐 Your API is now available at (FREE workers.dev subdomains):"
echo "   Main endpoint: https://ai-image-generator-api.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 1: https://ai-image-generator-api-1.YOUR_SUBDOMAIN.workers.dev"  
echo "   Account 2: https://ai-image-generator-api-2.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 3: https://ai-image-generator-api-3.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 4: https://ai-image-generator-api-4.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 5: https://ai-image-generator-api-5.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 6: https://ai-image-generator-api-6.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 7: https://ai-image-generator-api-7.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 8: https://ai-image-generator-api-8.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 9: https://ai-image-generator-api-9.YOUR_SUBDOMAIN.workers.dev"
echo "   Account 10: https://ai-image-generator-api-10.YOUR_SUBDOMAIN.workers.dev"
echo ""
echo "🚀 Ready for RapidAPI! Use any of these URLs as your API endpoint."