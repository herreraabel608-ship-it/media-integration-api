# Setup Instructions

## Step 1: Get TikTok API Credentials

### 1.1 Create a TikTok Developer Account
1. Visit [TikTok Developer Portal](https://developer.tiktok.com)
2. Click "Sign up" and create an account
3. Verify your email

### 1.2 Create an Application
1. Navigate to "My Apps" in the developer console
2. Click "Create an app"
3. Enter app details:
   - **App Name**: "Media Integration API" (or your preferred name)
   - **Application Category**: Select "E-commerce" or "Content Management"
   - **Development Platform**: Select "Server-to-server"
4. Accept the terms and click "Create"

### 1.3 Get Your Credentials
1. In your app dashboard, navigate to "Development" > "Basic Information"
2. You'll see:
   - **Client ID** (copy this as `TIKTOK_CLIENT_KEY`)
   - **Client Secret** (copy this as `TIKTOK_CLIENT_SECRET`)

### 1.4 Request API Scopes
1. Go to "Products" > "TikTok API"
2. Enable these scopes:
   - `video.list` - Access to user's videos
   - `video.publish` - Permission to publish videos
   - `user.info.basic` - Access to basic user info
3. Request approval (may take 24-48 hours)

### 1.5 Generate OAuth Tokens
1. Once approved, go to "Development" > "OAuth 2.0"
2. Set Redirect URI: `http://localhost:3000/callback`
3. Click "Generate" to get your tokens:
   - **Access Token** → `TIKTOK_ACCESS_TOKEN`
   - **Refresh Token** → `TIKTOK_REFRESH_TOKEN`

### 1.6 Get Your User ID
1. Make a simple API request to get your user ID:
```bash
curl -X GET "https://open.tiktokapis.com/v1/user/info/?fields=open_id" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
2. Copy the `open_id` from the response as `TIKTOK_USER_ID`

---

## Step 2: Set Up the Project

### 2.1 Clone Repository
```bash
git clone https://github.com/herreraabel608-ship-it/media-integration-api.git
cd media-integration-api
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Environment File
```bash
cp .env.example .env
```

### 2.4 Fill in Environment Variables
Edit `.env` with your credentials:

```env
PORT=3000
NODE_ENV=development

# TikTok API Credentials
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_ACCESS_TOKEN=your_access_token_here
TIKTOK_REFRESH_TOKEN=your_refresh_token_here
TIKTOK_USER_ID=your_user_id_here

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_12345
```

---

## Step 3: Run the Project

### 3.1 Development Mode
```bash
npm run dev
```

You should see:
```
🚀 Media Integration API is running on port 3000
📚 API Documentation available at http://localhost:3000
```

### 3.2 Production Build
```bash
npm run build
npm start
```

---

## Step 4: Generate JWT Token for Testing

### Option 1: Use Node.js REPL
```bash
node
```

```javascript
const jwt = require('jwt-simple');
const JWT_SECRET = 'your_super_secret_jwt_key_12345';
const token = jwt.encode({ user_id: '123', exp: Math.floor(Date.now() / 1000) + 3600 }, JWT_SECRET);
console.log(token);
```

### Option 2: Use an Online JWT Generator
1. Visit [jwt.io](https://jwt.io)
2. Paste your JWT_SECRET in the "Secret" field
3. Copy the generated token

---

## Step 5: Test API Endpoints

### Example: Post a Video

```bash
curl -X POST http://localhost:3000/api/tiktok/post \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://your-video-url.mp4",
    "caption": "Check out this amazing product! 🎯 #dropshipping",
    "disable_comment": false,
    "disable_duet": false,
    "disable_stitch": false
  }'
```

### Example: Get User Videos

```bash
curl -X GET http://localhost:3000/api/tiktok/videos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example: Get Video Analytics

```bash
curl -X GET http://localhost:3000/api/tiktok/video/VIDEO_ID/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example: Delete a Video

```bash
curl -X DELETE http://localhost:3000/api/tiktok/video/VIDEO_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Issue: "Invalid token" error
- Make sure your `JWT_SECRET` in `.env` matches the one used to generate the token
- JWT tokens expire; regenerate if needed

### Issue: "401 Unauthorized"
- Check that you're including the `Authorization: Bearer` header
- Verify the token is valid

### Issue: "TikTok API Error 401"
- Your access token may be expired; refresh it using the refresh token
- Check that your credentials in `.env` are correct

### Issue: "Video upload fails"
- Ensure the video URL is publicly accessible
- Check video format is MP4, WebM, or MOV
- Video should be 15 seconds to 10 minutes long

---

## Next Steps

1. **Integrate with your Frontend**: Use the API endpoints in your web/mobile app
2. **Add More Platforms**: Follow the same pattern to add Instagram, Facebook, YouTube
3. **Set Up Database**: Store video metadata and analytics in a database
4. **Deploy**: Deploy to Heroku, AWS, Digital Ocean, or your preferred hosting

---

## Support

For issues or questions:
1. Check the [TikTok API Documentation](https://developers.tiktok.com/doc/social-media-api-overview)
2. Review the README.md file
3. Open an issue on GitHub

---

**Happy content creation! 🚀**
