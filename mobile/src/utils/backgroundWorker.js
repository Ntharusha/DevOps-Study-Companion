import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { checkStudyStatusAndNotify } from './notificationHelper';

export const NOTIFICATION_BACKGROUND_TASK = 'devops-study-companion-notifications';

// Define the background task globally
TaskManager.defineTask(NOTIFICATION_BACKGROUND_TASK, async () => {
  try {
    console.log('[Background Task] Running DevOps Companion study status evaluation...');
    await checkStudyStatusAndNotify();
    return BackgroundTask.BackgroundTaskResult.NewData;
  } catch (error) {
    console.error('[Background Task] Error evaluating status in background:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
