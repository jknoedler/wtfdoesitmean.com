import { api } from './apiClient';


export const stripeCheckout = api.functions.stripeCheckout;

export const stripeWebhook = async (data) => {
  return api.request('/functions/stripe-webhook', {
    method: 'POST',
    body: data,
  });
};

export const cyaniteWebhook = async (data) => {
  return api.request('/functions/cyanite-webhook', {
    method: 'POST',
    body: data,
  });
};

export const cyaniteAnalyze = api.functions.cyaniteAnalyze;

export const generateSocialPreview = api.functions.generateSocialPreview;

export const spotifyPlaylist = api.functions.spotifyPlaylist;

export const adsTxt = async () => {
  return api.request('/functions/ads-txt');
};

export const validateDevPassword = api.functions.validateDevPassword;

export const sitemap = async () => {
  return api.request('/functions/sitemap');
};

export const robotsTxt = async () => {
  return api.request('/functions/robots-txt');
};

export const resetMonthlyLeaderboard = async () => {
  return api.request('/functions/reset-monthly-leaderboard', {
    method: 'POST',
  });
};

