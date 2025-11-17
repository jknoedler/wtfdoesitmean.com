import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "69083db69ccd1df29c9359c8", 
  requiresAuth: true // Ensure authentication is required for all operations
});
