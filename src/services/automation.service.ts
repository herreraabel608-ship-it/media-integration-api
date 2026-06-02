import { TikTokService } from './tiktok.service';
import {
  addVideo,
  getBestPerformingVideo,
  schedulePost,
  getPendingPosts,
  markScheduleAsPosted,
  markVideoAsPosted,
  getTemplateVideos,
  updateVideoAnalytics,
  getVideoById,
} from './database.service';
import { v4 as uuidv4 } from 'uuid';

const POSTS_PER_DAY = parseInt(process.env.POSTS_PER_DAY || '5');
const OPTIMAL_POST_TIMES = (process.env.OPTIMAL_POST_TIMES || '9,12,15,18,21').split(',').map(Number);

/**
 * Analyze best performing content and generate similar captions
 */
export async function analyzeBestPerformingContent(): Promise<string | null> {
  try {
    const bestVideo = await getBestPerformingVideo();

    if (!bestVideo) {
      console.log('📊 No posted videos yet to analyze');
      return null;
    }

    console.log('🏆 Best performing video found:', {
      views: bestVideo.views,
      likes: bestVideo.likes,
      caption: bestVideo.caption,
    });

    // Extract hashtags and key phrases from best video
    const caption = bestVideo.caption;
    const hashtags = caption.match(/#\w+/g) || [];
    const hasEmojis = /\p{Emoji}/gu.test(caption);

    // Generate similar caption with same hashtags
    const generatedCaptions = [
      `Check this out! ${hashtags.join(' ')} 🎯`,
      `Don't miss this! ${hashtags.join(' ')} ✨`,
      `Must see! ${hashtags.join(' ')} 🔥`,
      `Amazing content! ${hashtags.join(' ')} 💯`,
      `You'll love this! ${hashtags.join(' ')} 🚀`,
    ];

    // Return random caption from generated ones
    return generatedCaptions[Math.floor(Math.random() * generatedCaptions.length)];
  } catch (error) {
    console.error('Error analyzing best performing content:', error);
    return null;
  }
}

/**
 * Schedule posts for the day based on optimal times
 */
export async function schedulePostsForDay(): Promise<void> {
  try {
    const templateVideos = await getTemplateVideos();

    if (templateVideos.length === 0) {
      console.log('⚠️  No template videos available for scheduling');
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Create schedule for each optimal post time
    for (let i = 0; i < Math.min(POSTS_PER_DAY, OPTIMAL_POST_TIMES.length); i++) {
      const hour = OPTIMAL_POST_TIMES[i];
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hour, Math.floor(Math.random() * 60), 0);

      // If scheduled time is in the past, schedule for tomorrow
      if (scheduledTime < now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      // Select random template video
      const templateVideo = templateVideos[Math.floor(Math.random() * templateVideos.length)];

      // Generate new caption based on best performing content
      const newCaption = await analyzeBestPerformingContent();
      const caption = newCaption || templateVideo.caption;

      // Add new video to schedule
      const videoRecord = await addVideo({
        video_url: templateVideo.video_url,
        caption: caption,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        is_template: false,
      });

      // Schedule the post
      await schedulePost(videoRecord.id, scheduledTime);

      console.log(`📅 Post scheduled for ${scheduledTime.toLocaleString()} - Caption: ${caption}`);
    }
  } catch (error) {
    console.error('Error scheduling posts for day:', error);
  }
}

/**
 * Execute scheduled posts
 */
export async function executeScheduledPosts(): Promise<void> {
  try {
    const pendingPosts = await getPendingPosts();

    if (pendingPosts.length === 0) {
      console.log('✓ No pending posts at this time');
      return;
    }

    console.log(`🚀 Found ${pendingPosts.length} posts to execute`);

    for (const schedule of pendingPosts) {
      try {
        // Get video details
        const video = await getVideoById(schedule.video_id);

        // Post to TikTok
        const result = await TikTokService.createVideo({
          video_url: video.video_url,
          caption: video.caption,
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        });

        if (result.success && result.data?.video_id) {
          // Mark as posted in database
          await markVideoAsPosted(schedule.video_id, result.data.video_id);
          await markScheduleAsPosted(schedule.id);

          console.log(`✅ Video posted successfully: ${result.data.video_id}`);

          // Wait a bit between posts to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Failed to post video ${schedule.video_id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error executing scheduled posts:', error);
  }
}

/**
 * Refresh analytics for all posted videos
 */
export async function refreshAllAnalytics(): Promise<void> {
  try {
    const videos = await TikTokService.getUserVideos();

    if (!videos.success || !videos.data) {
      console.log('No videos found to update analytics');
      return;
    }

    console.log(`📊 Updating analytics for ${videos.data.length} videos`);

    for (const video of videos.data) {
      try {
        const analytics = await TikTokService.getVideoAnalytics(video.id);
        await updateVideoAnalytics(video.id, {
          views: analytics.views,
          likes: analytics.likes,
          comments: analytics.comments,
          shares: analytics.shares,
        });
      } catch (error) {
        console.error(`Failed to update analytics for video ${video.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error refreshing analytics:', error);
  }
}

/**
 * Initialize daily automation
 */
export async function initializeDailyAutomation(): Promise<void> {
  try {
    console.log('🤖 Initializing daily automation...');
    await refreshAllAnalytics();
    await schedulePostsForDay();
    console.log('✅ Daily automation initialized');
  } catch (error) {
    console.error('Error initializing daily automation:', error);
  }
}

/**
 * Get automation status
 */
export async function getAutomationStatus(): Promise<any> {
  try {
    const pendingPosts = await getPendingPosts();
    const bestVideo = await getBestPerformingVideo();
    const templates = await getTemplateVideos();

    return {
      status: 'active',
      pending_posts: pendingPosts.length,
      best_performing_video: bestVideo ? {
        views: bestVideo.views,
        likes: bestVideo.likes,
        caption: bestVideo.caption,
      } : null,
      template_count: templates.length,
      posts_per_day: POSTS_PER_DAY,
      optimal_post_times: OPTIMAL_POST_TIMES,
    };
  } catch (error) {
    console.error('Error getting automation status:', error);
    return { status: 'error', message: (error as any).message };
  }
}