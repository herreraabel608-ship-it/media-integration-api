import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

let db: Database | null = null;

export interface VideoRecord {
  id: string;
  video_url: string;
  caption: string;
  tiktok_video_id?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  posted_at?: Date;
  created_at: Date;
  is_template: boolean;
}

export interface PostingSchedule {
  id: string;
  video_id: string;
  scheduled_time: Date;
  posted: boolean;
  created_at: Date;
}

/**
 * Initialize SQLite database
 */
export async function initializeDatabase(): Promise<void> {
  try {
    db = await open({
      filename: path.join(process.cwd(), 'data', 'videos.db'),
      driver: sqlite3.Database,
    });

    await db.exec('PRAGMA foreign_keys = ON');

    // Create videos table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        video_url TEXT NOT NULL,
        caption TEXT NOT NULL,
        tiktok_video_id TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        posted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_template BOOLEAN DEFAULT 0
      )
    `);

    // Create posting schedule table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS posting_schedules (
        id TEXT PRIMARY KEY,
        video_id TEXT NOT NULL,
        scheduled_time DATETIME NOT NULL,
        posted BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(video_id) REFERENCES videos(id)
      )
    `);

    // Create analytics history table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_history (
        id TEXT PRIMARY KEY,
        video_id TEXT NOT NULL,
        views INTEGER,
        likes INTEGER,
        comments INTEGER,
        shares INTEGER,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(video_id) REFERENCES videos(id)
      )
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Add a video to the database
 */
export async function addVideo(video: Omit<VideoRecord, 'id' | 'created_at'>): Promise<VideoRecord> {
  const database = getDatabase();
  const id = uuidv4();

  await database.run(
    `INSERT INTO videos (id, video_url, caption, tiktok_video_id, views, likes, comments, shares, is_template)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, video.video_url, video.caption, video.tiktok_video_id || null, 0, 0, 0, 0, video.is_template ? 1 : 0]
  );

  return getVideoById(id);
}

/**
 * Get video by ID
 */
export async function getVideoById(id: string): Promise<VideoRecord> {
  const database = getDatabase();
  const row = await database.get('SELECT * FROM videos WHERE id = ?', [id]);

  if (!row) throw new Error(`Video with ID ${id} not found`);

  return {
    id: row.id,
    video_url: row.video_url,
    caption: row.caption,
    tiktok_video_id: row.tiktok_video_id,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    posted_at: row.posted_at ? new Date(row.posted_at) : undefined,
    created_at: new Date(row.created_at),
    is_template: row.is_template === 1,
  };
}

/**
 * Get all videos
 */
export async function getAllVideos(): Promise<VideoRecord[]> {
  const database = getDatabase();
  const rows = await database.all('SELECT * FROM videos ORDER BY created_at DESC');

  return rows.map((row) => ({
    id: row.id,
    video_url: row.video_url,
    caption: row.caption,
    tiktok_video_id: row.tiktok_video_id,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    posted_at: row.posted_at ? new Date(row.posted_at) : undefined,
    created_at: new Date(row.created_at),
    is_template: row.is_template === 1,
  }));
}

/**
 * Get best performing video
 */
export async function getBestPerformingVideo(): Promise<VideoRecord | null> {
  const database = getDatabase();
  const row = await database.get(
    `SELECT * FROM videos 
     WHERE posted_at IS NOT NULL 
     ORDER BY views DESC 
     LIMIT 1`
  );

  if (!row) return null;

  return {
    id: row.id,
    video_url: row.video_url,
    caption: row.caption,
    tiktok_video_id: row.tiktok_video_id,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    posted_at: row.posted_at ? new Date(row.posted_at) : undefined,
    created_at: new Date(row.created_at),
    is_template: row.is_template === 1,
  };
}

/**
 * Update video analytics
 */
export async function updateVideoAnalytics(
  videoId: string,
  analytics: { views: number; likes: number; comments: number; shares: number }
): Promise<void> {
  const database = getDatabase();

  // Update main video record
  await database.run(
    `UPDATE videos SET views = ?, likes = ?, comments = ?, shares = ? WHERE id = ?`,
    [analytics.views, analytics.likes, analytics.comments, analytics.shares, videoId]
  );

  // Record in analytics history
  const historyId = uuidv4();
  await database.run(
    `INSERT INTO analytics_history (id, video_id, views, likes, comments, shares)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [historyId, videoId, analytics.views, analytics.likes, analytics.comments, analytics.shares]
  );
}

/**
 * Schedule a post
 */
export async function schedulePost(videoId: string, scheduledTime: Date): Promise<PostingSchedule> {
  const database = getDatabase();
  const id = uuidv4();

  await database.run(
    `INSERT INTO posting_schedules (id, video_id, scheduled_time, posted) VALUES (?, ?, ?, 0)`,
    [id, videoId, scheduledTime.toISOString()]
  );

  return {
    id,
    video_id: videoId,
    scheduled_time: scheduledTime,
    posted: false,
    created_at: new Date(),
  };
}

/**
 * Get pending posts
 */
export async function getPendingPosts(): Promise<PostingSchedule[]> {
  const database = getDatabase();
  const now = new Date();

  const rows = await database.all(
    `SELECT * FROM posting_schedules 
     WHERE posted = 0 AND scheduled_time <= ? 
     ORDER BY scheduled_time ASC`,
    [now.toISOString()]
  );

  return rows.map((row) => ({
    id: row.id,
    video_id: row.video_id,
    scheduled_time: new Date(row.scheduled_time),
    posted: row.posted === 1,
    created_at: new Date(row.created_at),
  }));
}

/**
 * Mark schedule as posted
 */
export async function markScheduleAsPosted(scheduleId: string): Promise<void> {
  const database = getDatabase();
  await database.run(
    `UPDATE posting_schedules SET posted = 1 WHERE id = ?`,
    [scheduleId]
  );
}

/**
 * Mark video as posted with TikTok ID
 */
export async function markVideoAsPosted(videoId: string, tiktokVideoId: string): Promise<void> {
  const database = getDatabase();
  const now = new Date();

  await database.run(
    `UPDATE videos SET posted_at = ?, tiktok_video_id = ? WHERE id = ?`,
    [now.toISOString(), tiktokVideoId, videoId]
  );
}

/**
 * Get template videos
 */
export async function getTemplateVideos(): Promise<VideoRecord[]> {
  const database = getDatabase();
  const rows = await database.all(
    `SELECT * FROM videos WHERE is_template = 1 ORDER BY created_at DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    video_url: row.video_url,
    caption: row.caption,
    tiktok_video_id: row.tiktok_video_id,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    posted_at: row.posted_at ? new Date(row.posted_at) : undefined,
    created_at: new Date(row.created_at),
    is_template: true,
  }));
}