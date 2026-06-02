import { Router, Request, Response } from 'express';
import { TikTokService } from '../services/tiktok.service';
import { validateRequest } from '../middleware/validation';

const router = Router();

/**
 * POST /api/tiktok/post
 * Create and publish a new video on TikTok
 */
router.post('/post', validateRequest, async (req: Request, res: Response) => {
  try {
    const { video_url, caption, description, disable_comment, disable_duet, disable_stitch } = req.body;

    // Validate required fields
    if (!video_url || !caption) {
      return res.status(400).json({
        success: false,
        message: 'video_url and caption are required',
      });
    }

    const result = await TikTokService.createVideo({
      video_url,
      caption,
      description,
      disable_comment,
      disable_duet,
      disable_stitch,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to post video',
      error: error.error || error,
    });
  }
});

/**
 * DELETE /api/tiktok/video/:videoId
 * Delete a video from TikTok
 */
router.delete('/video/:videoId', validateRequest, async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'videoId is required',
      });
    }

    const result = await TikTokService.deleteVideo(videoId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete video',
      error: error.error || error,
    });
  }
});

/**
 * GET /api/tiktok/video/:videoId/analytics
 * Get analytics for a specific video
 */
router.get('/video/:videoId/analytics', validateRequest, async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'videoId is required',
      });
    }

    const analytics = await TikTokService.getVideoAnalytics(videoId);
    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Analytics retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics',
      error: error.error || error,
    });
  }
});

/**
 * GET /api/tiktok/videos
 * Get all videos for the authenticated user
 */
router.get('/videos', validateRequest, async (req: Request, res: Response) => {
  try {
    const result = await TikTokService.getUserVideos();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch videos',
      error: error.error || error,
    });
  }
});

/**
 * PATCH /api/tiktok/video/:videoId
 * Update video information (caption, etc)
 */
router.patch('/video/:videoId', validateRequest, async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { caption } = req.body;

    if (!videoId || !caption) {
      return res.status(400).json({
        success: false,
        message: 'videoId and caption are required',
      });
    }

    const result = await TikTokService.updateVideo(videoId, caption);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update video',
      error: error.error || error,
    });
  }
});

export default router;
