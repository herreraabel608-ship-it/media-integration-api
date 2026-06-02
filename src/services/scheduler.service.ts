import cron from 'node-cron';
import { executeScheduledPosts, refreshAllAnalytics, initializeDailyAutomation } from './automation.service';

let schedulerRunning = false;

/**
 * Initialize scheduled tasks
 */
export function initializeScheduler(): void {
  if (schedulerRunning) {
    console.log('⚠️  Scheduler is already running');
    return;
  }

  console.log('🕐 Initializing scheduler...');

  // Check for pending posts every minute
  cron.schedule('* * * * *', async () => {
    console.log('[' + new Date().toLocaleTimeString() + '] Checking for pending posts...');
    try {
      await executeScheduledPosts();
    } catch (error) {
      console.error('Error in post execution scheduler:', error);
    }
  });

  // Refresh analytics every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[' + new Date().toLocaleTimeString() + '] Refreshing analytics...');
    try {
      await refreshAllAnalytics();
    } catch (error) {
      console.error('Error in analytics refresh scheduler:', error);
    }
  });

  // Initialize daily automation at 12:01 AM
  cron.schedule('1 0 * * *', async () => {
    console.log('[' + new Date().toLocaleTimeString() + '] Initializing daily automation...');
    try {
      await initializeDailyAutomation();
    } catch (error) {
      console.error('Error in daily automation scheduler:', error);
    }
  });

  schedulerRunning = true;
  console.log('✅ Scheduler initialized');
}

export function stopScheduler(): void {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  schedulerRunning = false;
  console.log('🛑 Scheduler stopped');
}

export function isSchedulerRunning(): boolean {
  return schedulerRunning;
}