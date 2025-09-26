// Cloudflare Workers AI Image Generator API - Complete Standalone Version
// No UI dependencies - API endpoints only

// RapidAPI Subscription Tiers & Rate Limiting Configuration
const SUBSCRIPTION_TIERS = {
  free: { 
    name: 'Free',
    requests: 25, 
    window: 86400000, // 24 hours
    daily_limit: 25,
    total_images: 0,
    price: 0
  },
  gift: { 
    name: 'Gift (999 Images)',
    requests: 100, 
    window: 86400000,
    daily_limit: 100,
    total_images: 999,
    price: 0
  },
  premium_gift: { 
    name: 'Premium Gift (1499 Images FREE!)',
    requests: 150, 
    window: 86400000,
    daily_limit: 150,
    total_images: 1499,
    price: 0
  },
  starter: { 
    name: 'Starter Plan',
    requests: 500, 
    window: 86400000,
    daily_limit: 500,
    total_images: 0,
    price: 9.99
  },
  enterprise: { 
    name: 'Enterprise Plan',
    requests: 5000, 
    window: 86400000,
    daily_limit: 5000,
    total_images: 0,
    price: 49.99
  }
};

// Gift codes
const GIFT_CODES = {
  'WELCOME999': { tier: 'gift', used: false, created: Date.now() },
  'LAUNCH2024': { tier: 'gift', used: false, created: Date.now() },
  'BETA999': { tier: 'gift', used: false, created: Date.now() },
  'RAPIDAPI999': { tier: 'gift', used: false, created: Date.now() },
  'CLOUDFLARE999': { tier: 'gift', used: false, created: Date.now() },
  'PREMIUM1499': { tier: 'premium_gift', used: false, created: Date.now() },
  'FREE1499': { tier: 'premium_gift', used: false, created: Date.now() },
  'LAUNCH1499': { tier: 'premium_gift', used: false, created: Date.now() },
  'WELCOME1499': { tier: 'premium_gift', used: false, created: Date.now() },
  'SUPERUSER1499': { tier: 'premium_gift', used: false, created: Date.now() }
};

// In-memory storage
const rateLimitStore = new Map();
const userSubscriptions = new Map();
const giftCodeUsage = new Map();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret',
  'Access-Control-Expose-Headers': 'x-ratelimit-requests-limit, x-ratelimit-requests-remaining, x-rapidapi-region'
};

// Helper function to create JSON response with CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// Image generation service (Pollinations.ai integration)
class ImageGenerationService {
  constructor() {
    this.baseImageUrl = 'https://image.pollinations.ai';
    this.baseTextUrl = 'https://text.pollinations.ai';
  }

  async generateImage(params) {
    try {
      const encodedPrompt = encodeURIComponent(params.prompt);
      const url = `${this.baseImageUrl}/prompt/${encodedPrompt}`;
      
      const queryParams = new URLSearchParams();
      
      if (params.model) queryParams.append('model', params.model);
      if (params.width) queryParams.append('width', params.width.toString());
      if (params.height) queryParams.append('height', params.height.toString());
      if (params.seed) queryParams.append('seed', params.seed.toString());
      if (params.enhance) queryParams.append('enhance', 'true');
      if (params.safe) queryParams.append('safe', 'true');
      if (params.private) queryParams.append('private', 'true');
      if (params.guidance_scale) queryParams.append('guidance_scale', params.guidance_scale.toString());
      if (params.num_inference_steps) queryParams.append('num_inference_steps', params.num_inference_steps.toString());
      if (params.strength) queryParams.append('strength', params.strength.toString());
      if (params.scheduler) queryParams.append('scheduler', params.scheduler);
      queryParams.append('nologo', 'true');
      if (params.image) queryParams.append('image', params.image);
      
      const finalUrl = queryParams.toString() ? `${url}?${queryParams}` : url;
      
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Pollination-AI-Pro/1.0',
          'Accept': 'image/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Image generation failed with status ${response.status}`);
      }
      
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate image. Please try again later.');
    }
  }

  async generateText(params) {
    try {
      const encodedPrompt = encodeURIComponent(params.prompt);
      const url = `${this.baseTextUrl}/${encodedPrompt}`;
      
      const queryParams = new URLSearchParams();
      
      if (params.model) queryParams.append('model', params.model);
      if (params.seed) queryParams.append('seed', params.seed.toString());
      if (params.temperature) queryParams.append('temperature', params.temperature.toString());
      if (params.top_p) queryParams.append('top_p', params.top_p.toString());
      if (params.presence_penalty) queryParams.append('presence_penalty', params.presence_penalty.toString());
      if (params.frequency_penalty) queryParams.append('frequency_penalty', params.frequency_penalty.toString());
      if (params.json) queryParams.append('json', 'true');
      if (params.system) queryParams.append('system', encodeURIComponent(params.system));
      if (params.stream) queryParams.append('stream', 'true');
      if (params.private) queryParams.append('private', 'true');
      
      const finalUrl = queryParams.toString() ? `${url}?${queryParams}` : url;
      
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Pollination-AI-Pro/1.0',
          'Accept': 'text/plain'
        }
      });
      
      return await response.text();
    } catch (error) {
      console.error('Text generation error:', error);
      throw new Error('Failed to generate text. Please try again later.');
    }
  }
}

// Initialize service
const imageService = new ImageGenerationService();

// RapidAPI Authentication Check
function checkRapidAPIAuth(request) {
  const rapidApiKey = request.headers.get('X-RapidAPI-Key');
  const rapidApiHost = request.headers.get('X-RapidAPI-Host');
  
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Skip auth for health and docs endpoints
  if (path === '/health' || path === '/api/docs' || path === '/api/models' || path === '/') {
    return { valid: true };
  }
  
  // Validate RapidAPI headers
  if (!rapidApiKey) {
    return {
      valid: false,
      response: jsonResponse({
        success: false,
        error: {
          code: 'MISSING_RAPIDAPI_KEY',
          message: 'Missing X-RapidAPI-Key header',
          details: 'This API requires a valid RapidAPI key'
        },
        data: null
      }, 401)
    };
  }
  
  if (!rapidApiHost) {
    return {
      valid: false,
      response: jsonResponse({
        success: false,
        error: {
          code: 'MISSING_RAPIDAPI_HOST',
          message: 'Missing X-RapidAPI-Host header',
          details: 'This API requires a valid RapidAPI host header'
        },
        data: null
      }, 401)
    };
  }
  
  return { valid: true, rapidApiKey, rapidApiHost };
}

// Rate limiting check
function checkRateLimit(rapidApiKey) {
  const now = Date.now();
  
  // Get user subscription info
  const userSub = userSubscriptions.get(rapidApiKey) || {
    tier: 'free',
    images_used_today: 0,
    total_images_used: 0,
    last_reset: now,
    created_at: now
  };
  
  // Get tier limits
  const tierLimits = SUBSCRIPTION_TIERS[userSub.tier];
  
  // Reset daily counter if window expired
  if (now > userSub.last_reset + tierLimits.window) {
    userSub.images_used_today = 0;
    userSub.last_reset = now;
  }
  
  // Check daily rate limit
  if (userSub.images_used_today >= tierLimits.daily_limit) {
    const resetIn = Math.ceil((userSub.last_reset + tierLimits.window - now) / 1000);
    
    return {
      allowed: false,
      response: jsonResponse({
        success: false,
        error: {
          code: 'DAILY_LIMIT_EXCEEDED',
          message: `Daily limit of ${tierLimits.daily_limit} images exceeded for ${tierLimits.name} tier`,
          details: `Resets in ${Math.ceil(resetIn / 3600)} hours`,
          tier: userSub.tier,
          retry_after: resetIn
        },
        data: null
      }, 429)
    };
  }
  
  // Check total images limit (for gift tier)
  if (tierLimits.total_images > 0 && userSub.total_images_used >= tierLimits.total_images) {
    return {
      allowed: false,
      response: jsonResponse({
        success: false,
        error: {
          code: 'TOTAL_LIMIT_EXCEEDED',
          message: `You have used all ${tierLimits.total_images} images from your ${tierLimits.name}`,
          details: 'Please upgrade to Starter or Enterprise plan for unlimited images',
          tier: userSub.tier,
          images_remaining: 0
        },
        data: null
      }, 429)
    };
  }
  
  // Store updated subscription info
  userSubscriptions.set(rapidApiKey, userSub);
  
  return { allowed: true, userSub, tierLimits };
}

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Health check endpoint - No auth required
  if (path === '/health') {
    return jsonResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      region: 'global',
      subscription_tiers: Object.keys(SUBSCRIPTION_TIERS),
      available_gift_codes: Object.keys(GIFT_CODES).length
    });
  }

  // API Models endpoint - No auth required
  if (path === '/api/models') {
    return jsonResponse({
      success: true,
      message: 'Available AI models for image generation',
      data: {
        image_models: [
          {
            id: 'flux',
            name: 'FLUX.1 Base',
            description: 'High-quality general purpose image generation',
            type: 'text-to-image'
          },
          {
            id: 'flux-dev',
            name: 'FLUX.1 Dev',
            description: 'Development version with enhanced features',
            type: 'text-to-image'
          },
          {
            id: 'flux-schnell',
            name: 'FLUX.1 Schnell',
            description: 'Fastest generation for quick prototyping',
            type: 'text-to-image'
          },
          {
            id: 'flux-pro',
            name: 'FLUX.1 Pro',
            description: 'Professional quality with premium features',
            type: 'text-to-image'
          },
          {
            id: 'flux-realism',
            name: 'FLUX Realism',
            description: 'Specialized for photorealistic images',
            type: 'text-to-image'
          },
          {
            id: 'flux-anime',
            name: 'FLUX Anime',
            description: 'Optimized for anime and manga style images',
            type: 'text-to-image'
          },
          {
            id: 'kontext',
            name: 'Kontext',
            description: 'Context-aware image generation',
            type: 'text-to-image'
          },
          {
            id: 'stable-diffusion',
            name: 'Stable Diffusion',
            description: 'Classic stable diffusion model',
            type: 'text-to-image'
          },
          {
            id: 'stable-diffusion-xl',
            name: 'Stable Diffusion XL',
            description: 'High resolution stable diffusion variant',
            type: 'text-to-image'
          }
        ],
        text_models: [
          {
            id: 'openai',
            name: 'OpenAI GPT',
            description: 'High-quality text generation',
            type: 'text-generation'
          },
          {
            id: 'mistral',
            name: 'Mistral',
            description: 'Fast and efficient text generation',
            type: 'text-generation'
          },
          {
            id: 'llama',
            name: 'LLaMA',
            description: 'Open-source language model',
            type: 'text-generation'
          }
        ]
      }
    });
  }

  // API Documentation endpoint - No auth required
  if (path === '/api/docs') {
    return jsonResponse({
      success: true,
      message: 'AI Generation API Documentation',
      data: {
        name: 'AI Generation API',
        version: '1.0.0',
        description: 'RapidAPI-compatible AI image and text generation service',
        base_url: url.origin,
        authentication: {
          type: 'RapidAPI Headers',
          required_headers: [
            'X-RapidAPI-Key: your_rapidapi_key',
            'X-RapidAPI-Host: your_rapidapi_host'
          ]
        },
        rate_limiting: SUBSCRIPTION_TIERS,
        endpoints: {
          'GET /health': {
            description: 'Health check endpoint',
            auth_required: false,
            rate_limited: false
          },
          'GET /api/models': {
            description: 'List available AI models',
            auth_required: false,
            rate_limited: false
          },
          'GET /api/image/generate': {
            description: 'Generate images from text prompts',
            auth_required: true,
            rate_limited: true,
            parameters: {
              prompt: { type: 'string', required: true, description: 'Text description of desired image' },
              model: { type: 'string', default: 'flux', description: 'AI model to use' },
              width: { type: 'integer', default: 1024, description: 'Image width in pixels' },
              height: { type: 'integer', default: 1024, description: 'Image height in pixels' },
              format: { type: 'string', default: 'base64', description: 'Response format' },
              seed: { type: 'integer', description: 'Random seed for reproducible results' },
              enhance: { type: 'boolean', default: false, description: 'Auto-enhance prompt' },
              safe: { type: 'boolean', default: true, description: 'Enable NSFW filter' }
            }
          },
          'GET /api/text/generate': {
            description: 'Generate text from prompts',
            auth_required: true,
            rate_limited: true,
            parameters: {
              prompt: { type: 'string', required: true, description: 'Text prompt' },
              model: { type: 'string', default: 'openai', description: 'Text generation model' },
              temperature: { type: 'number', default: 0.7, description: 'Creativity level' },
              max_tokens: { type: 'integer', default: 1000, description: 'Maximum output length' }
            }
          },
          'POST /api/redeem-gift': {
            description: 'Redeem gift codes for premium features',
            auth_required: true,
            rate_limited: false
          }
        }
      }
    });
  }

  // RapidAPI Authentication Check for protected endpoints
  const authCheck = checkRapidAPIAuth(request);
  if (!authCheck.valid) {
    return authCheck.response;
  }

  const { rapidApiKey } = authCheck;

  // Rate limiting check for API endpoints
  if (path.startsWith('/api/') && rapidApiKey) {
    const rateLimitCheck = checkRateLimit(rapidApiKey);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response;
    }
  }

  // Image generation endpoint
  if (path === '/api/image/generate' && method === 'GET') {
    const startTime = Date.now();
    
    try {
      const prompt = url.searchParams.get('prompt');
      const model = url.searchParams.get('model') || 'flux';
      const width = parseInt(url.searchParams.get('width')) || 1024;
      const height = parseInt(url.searchParams.get('height')) || 1024;
      const format = url.searchParams.get('format') || 'base64';
      const seed = url.searchParams.get('seed') ? parseInt(url.searchParams.get('seed')) : undefined;
      const enhance = url.searchParams.get('enhance') === 'true';
      const safe = url.searchParams.get('safe') !== 'false'; // Default to true
      const guidance_scale = url.searchParams.get('guidance_scale') ? parseFloat(url.searchParams.get('guidance_scale')) : undefined;
      const num_inference_steps = url.searchParams.get('num_inference_steps') ? parseInt(url.searchParams.get('num_inference_steps')) : undefined;
      
      // Validate required parameters
      if (!prompt || prompt.trim().length === 0) {
        return jsonResponse({
          success: false,
          error: {
            code: 'MISSING_PROMPT',
            message: 'The prompt parameter is required and cannot be empty',
            details: 'Please provide a text description for image generation'
          },
          data: null
        }, 400);
      }
      
      // Validate prompt length
      if (prompt.length > 1000) {
        return jsonResponse({
          success: false,
          error: {
            code: 'PROMPT_TOO_LONG',
            message: 'Prompt must be less than 1000 characters',
            details: `Your prompt is ${prompt.length} characters long`
          },
          data: null
        }, 400);
      }

      // Generate image
      const imageBuffer = await imageService.generateImage({
        prompt,
        model,
        width,
        height,
        seed,
        enhance,
        safe,
        guidance_scale,
        num_inference_steps
      });

      // Update user usage
      const userSub = userSubscriptions.get(rapidApiKey);
      if (userSub) {
        userSub.images_used_today++;
        userSub.total_images_used++;
        userSubscriptions.set(rapidApiKey, userSub);
      }

      // Convert to base64 for response
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      const processingTime = Date.now() - startTime;

      if (format === 'base64' || format === 'both') {
        return jsonResponse({
          success: true,
          message: 'Image generated successfully',
          data: {
            prompt: prompt,
            model: model,
            width: width,
            height: height,
            format: format,
            image_base64: `data:image/png;base64,${base64Image}`,
            generated_at: new Date().toISOString(),
            generation_time_seconds: processingTime / 1000,
            request_id: crypto.randomUUID()
          },
          metadata: {
            processing_time_ms: processingTime,
            api_version: '1.0.0',
            endpoint: 'workers.dev'
          }
        });
      } else {
        // Return image directly
        return new Response(imageBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders
          }
        });
      }
      
    } catch (error) {
      console.error('Image generation error:', error);
      return jsonResponse({
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate image',
          details: error.message
        },
        data: null
      }, 500);
    }
  }

  // Text generation endpoint
  if (path === '/api/text/generate' && method === 'GET') {
    const startTime = Date.now();
    
    try {
      const prompt = url.searchParams.get('prompt');
      const model = url.searchParams.get('model') || 'openai';
      const temperature = url.searchParams.get('temperature') ? parseFloat(url.searchParams.get('temperature')) : 0.7;
      const seed = url.searchParams.get('seed') ? parseInt(url.searchParams.get('seed')) : undefined;
      
      if (!prompt || prompt.trim().length === 0) {
        return jsonResponse({
          success: false,
          error: {
            code: 'MISSING_PROMPT',
            message: 'The prompt parameter is required and cannot be empty'
          },
          data: null
        }, 400);
      }

      const generatedText = await imageService.generateText({
        prompt,
        model,
        temperature,
        seed
      });

      const processingTime = Date.now() - startTime;

      return jsonResponse({
        success: true,
        message: 'Text generated successfully',
        data: {
          prompt: prompt,
          model: model,
          generated_text: generatedText,
          generated_at: new Date().toISOString(),
          generation_time_seconds: processingTime / 1000
        },
        metadata: {
          processing_time_ms: processingTime,
          api_version: '1.0.0'
        }
      });
      
    } catch (error) {
      console.error('Text generation error:', error);
      return jsonResponse({
        success: false,
        error: {
          code: 'TEXT_GENERATION_FAILED',
          message: 'Failed to generate text',
          details: error.message
        },
        data: null
      }, 500);
    }
  }

  // Gift code redemption endpoint
  if (path === '/api/redeem-gift' && method === 'POST') {
    try {
      const body = await request.json();
      const { gift_code } = body;
      
      if (!gift_code) {
        return jsonResponse({
          success: false,
          error: {
            code: 'INVALID_GIFT_CODE',
            message: 'Gift code is required'
          },
          data: null
        }, 400);
      }
      
      const giftInfo = GIFT_CODES[gift_code.toUpperCase()];
      if (!giftInfo) {
        return jsonResponse({
          success: false,
          error: {
            code: 'GIFT_CODE_NOT_FOUND',
            message: 'Invalid gift code'
          },
          data: null
        }, 404);
      }
      
      // Apply gift to user
      const userSub = userSubscriptions.get(rapidApiKey) || {
        tier: 'free',
        images_used_today: 0,
        total_images_used: 0,
        last_reset: Date.now(),
        created_at: Date.now()
      };
      
      userSub.tier = giftInfo.tier;
      userSubscriptions.set(rapidApiKey, userSub);
      
      const tierInfo = SUBSCRIPTION_TIERS[userSub.tier];
      
      return jsonResponse({
        success: true,
        message: 'Gift code redeemed successfully!',
        data: {
          gift_code: gift_code.toUpperCase(),
          tier: userSub.tier,
          tier_name: tierInfo.name,
          daily_limit: tierInfo.daily_limit,
          total_images: tierInfo.total_images
        }
      });
      
    } catch (error) {
      return jsonResponse({
        success: false,
        error: {
          code: 'REDEMPTION_FAILED',
          message: 'Failed to redeem gift code',
          details: error.message
        },
        data: null
      }, 500);
    }
  }

  // Root endpoint with API info
  if (path === '/') {
    return jsonResponse({
      success: true,
      message: 'AI Generation API - Powered by Pollinations.ai',
      data: {
        name: 'AI Generation API',
        version: '1.0.0',
        description: 'Generate high-quality images and text using advanced AI models',
        endpoints: {
          'GET /health': 'Health check',
          'GET /api/models': 'List available models',
          'GET /api/docs': 'API documentation',
          'GET /api/image/generate': 'Generate images',
          'GET /api/text/generate': 'Generate text',
          'POST /api/redeem-gift': 'Redeem gift codes'
        },
        documentation: `${url.origin}/api/docs`,
        status: 'operational'
      }
    });
  }

  // Default 404 response
  return jsonResponse({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: 'Endpoint not found',
      details: `${method} ${path} is not available`
    },
    data: null
  }, 404);
}

// Cloudflare Workers event listener
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Export for compatibility
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};