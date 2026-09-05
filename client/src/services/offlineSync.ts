export interface QueuedMutation {
  clientMutationId: string;
  entityType: 'DAILY_TASK_RESULT' | 'BEHAVIOR_LOG' | 'SPEECH_LOG';
  action: 'CREATE' | 'UPDATE';
  payload: any;
  createdAt: string;
}

const STORAGE_KEY = 'mehr_offline_sync_queue';

export class OfflineSyncService {
  public static getQueue(): QueuedMutation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static enqueue(mutation: Omit<QueuedMutation, 'clientMutationId' | 'createdAt'>): void {
    const queue = this.getQueue();
    const item: QueuedMutation = {
      ...mutation,
      clientMutationId: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    queue.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    console.log('Saved offline mutation to local queue:', item);
  }

  public static clearQueue(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  public static async flushQueue(apiClient: any): Promise<number> {
    const queue = this.getQueue();
    if (queue.length === 0) return 0;

    try {
      console.log(`Flushing ${queue.length} offline mutations to server...`);
      const response = await apiClient.post('/api/sync', { mutations: queue });
      if (response?.data?.success) {
        this.clearQueue();
        return response.data.syncedCount || queue.length;
      }
    } catch (err) {
      console.error('Failed to flush offline sync queue:', err);
    }
    return 0;
  }
}
