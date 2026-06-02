import axios from 'axios';
import { TikTokConfig, tiktokAxios } from '../config/tiktok';

interface CreateVideoPayload {
  video_url: string;
  caption: string;
  description?: string;
  disable_comment?: boolean;
  disable_duet?: boolean;
  disable_stitch?: boolean;
}

interface DeleteVideoPayload {
  video_id: string;
}

interface VideoAnalytics {
  video_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  completed_views: number;
}

export class TikTokService {
  /**
   * Post a video to TikTok
   * @param payload Video payload with URL and caption
   * @returns Video creation response
   */
  static async createVideo(payload: CreateVideoPayload): Promise<any> {
    try {
      const response = await tiktokAxios.post('/video/publish/', {
        data: {
          video_url: payload.video_url,
          caption: payload.caption,
          description: payload.description || '',
          disable_comment: payload.disable_comment || false,
          disable_duet: payload.disable_duet || false,
          disable_stitch: payload.disable_stitch || false,
        },
      });

      console.log('Video created successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Video posted to TikTok successfully',
      };
    } catch (error: any) {
      console.error('Error creating TikTok video:', error.response?.data || error.message);
      throw {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create TikTok video',
      };
    }
  }

  /**
   * Delete a video from TikTok
   * @param videoId Video ID to delete
   * @returns Deletion response
   */
  static async deleteVideo(videoId: string): Promise<any> {
    try {
      const response = await tiktokAxios.delete(`/video/${videoId}/`, {
        params: {
          fields: 'id,create_time,video_description',
        },
      });

      console.log('Video deleted successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Video deleted from TikTok successfully',
      };
    } catch (error: any) {
      console.error('Error deleting TikTok video:', error.response?.data || error.message);
      throw {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to delete TikTok video',
      };
    }
  }

  /**
   * Get video analytics
   * @param videoId Video ID to fetch analytics for
   * @returns Video analytics
   */
  static async getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
    try {
      const response = await tiktokAxios.get(`/video/${videoId}/`, {
        params: {
          fields: 'id,view_count,like_count,comment_count,share_count,download_count',
        },
      });

      return {
        video_id: response.data.id,
        views: response.data.view_count || 0,
        likes: response.data.like_count || 0,
        comments: response.data.comment_count || 0,
        shares: response.data.share_count || 0,
        completed_views: response.data.download_count || 0,
      };
    } catch (error: any) {
      console.error('Error fetching video analytics:', error.response?.data || error.message);
      throw {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to fetch video analytics',
      };
    }
  }

  /**
   * Get all videos for the user
   * @returns List of videos
   */
  static async getUserVideos(): Promise<any> {
    try {
      const response = await tiktokAxios.get('/video/list/', {
        params: {
          fields: 'id,create_time,video_description,view_count,like_count',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Videos retrieved successfully',
      };
    } catch (error: any) {
      console.error('Error fetching user videos:', error.response?.data || error.message);
      throw {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to fetch user videos',
      };
    }
  }

  /**
   * Update video information (caption, etc)
   * @param videoId Video ID
   * @param caption New caption
   * @returns Update response
   */
  static async updateVideo(videoId: string, caption: string): Promise<any> {
    try {
      const response = await tiktokAxios.patch(`/video/${videoId}/`, {
        data: {
          caption: caption,
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Video updated successfully',
      };
    } catch (error: any) {
      console.error('Error updating TikTok video:', error.response?.data || error.message);
      throw {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to update TikTok video',
      };
    }
  }
}
