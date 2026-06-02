import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import {
  getAutomationStatus,
  initializeDailyAutomation,
  executeScheduledPosts,
  refreshAllAnalytics,
  analyzeBestPerformingContent,
} from '../services/automation.service';
import { addVideo, getPendingPosts, getTemplateVideos } from '../services/database.service';

const router = Router();

router.post('/template', validateRequest, async (req: Request, res: Response) => {
  try {
    const { video_url, caption } = req.body;
    if (!video_url || !caption) {
      return res.status(400).json({
        success: false,
        message: 'video_url and caption are required',
      });
    }
    const video = await addVideo({
      video_url,
      caption,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      is_template: true,
    });
    res.status(201).json({
      success: true,
      data: video,
      message: 'Template video added successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add template video',
      error: error,
    });
  }
});

router.get('/templates', validateRequest, async (req: Request, res: Response) => {
  try {
    const templates = await getTemplateVideos();
    res.status(200).json({
      success: true,
      data: templates,
      count: templates.length,
      message: 'Templates retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch templates',
      error: error,
    });
  }
});

router.get('/status', validateRequest, async (req: Request, res: Response) => {
  try {
    const status = await getAutomationStatus();
    res.status(200).json({
      success: true,
      data: status,
      message: 'Automation status retrieved',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get automation status',
      error: error,
    });
  }
});

router.post('/initialize', validateRequest, async (req: Request, res: Response) => {
  try {
    await initializeDailyAutomation();
    res.status(200).json({
      success: true,
      message: 'Daily automation initialized successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize automation',
      error: error,
    });
  }
});

router.post('/execute', validateRequest, async (req: Request, res: Response) => {
  try {
    await executeScheduledPosts();
    res.status(200).json({
      success: true,
      message: 'Scheduled posts executed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute scheduled posts',
      error: error,
    });
  }
});

router.post('/refresh-analytics', validateRequest, async (req: Request, res: Response) => {
  try {
    await refreshAllAnalytics();
    res.status(200).json({
      success: true,
      message: 'Analytics refreshed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to refresh analytics',
      error: error,
    });
  }
});

router.get('/pending-posts', validateRequest, async (req: Request, res: Response) => {
  try {
    const pendingPosts = await getPendingPosts();
    res.status(200).json({
      success: true,
      data: pendingPosts,
      count: pendingPosts.length,
      message: 'Pending posts retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pending posts',
      error: error,
    });
  }
});

router.get('/analyze-best-content', validateRequest, async (req: Request, res: Response) => {
  try {
    const suggestion = await analyzeBestPerformingContent();
    res.status(200).json({
      success: true,
      data: { suggested_caption: suggestion },
      message: 'Content analysis completed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze content',
      error: error,
    });
  }
});

export default router;