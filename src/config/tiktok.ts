import axios from 'axios';

export const TikTokConfig = {
  clientKey: process.env.TIKTOK_CLIENT_KEY || '',
  clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
  accessToken: process.env.TIKTOK_ACCESS_TOKEN || '',
  refreshToken: process.env.TIKTOK_REFRESH_TOKEN || '',
  userId: process.env.TIKTOK_USER_ID || '',
  baseURL: 'https://open.tiktokapis.com/v1',
};

export const tiktokAxios = axios.create({
  baseURL: TikTokConfig.baseURL,
  headers: {
    'Authorization': `Bearer ${TikTokConfig.accessToken}`,
    'Content-Type': 'application/json',
  },
});

// Refresh access token when expired
export const refreshTikTokToken = async (): Promise<string> => {
  try {
    const response = await axios.post('https://open.tiktokapis.com/v1/oauth/token/refresh', {
      client_key: TikTokConfig.clientKey,
      client_secret: TikTokConfig.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: TikTokConfig.refreshToken,
    });

    const newAccessToken = response.data.access_token;
    process.env.TIKTOK_ACCESS_TOKEN = newAccessToken;

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing TikTok token:', error);
    throw error;
  }
};
