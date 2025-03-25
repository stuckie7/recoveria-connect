
import { Resource } from '@/types';

export type RecommendationType = 'mood' | 'triggers' | 'strategy' | 'general';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  resources: string[];  // Resource IDs
  reason: string;
  priority: number;  // 1-10, higher means more important
}

/**
 * Get resources by IDs
 */
export const getResourcesByIds = (resourceIds: string[], allResources: Resource[]): Resource[] => {
  return allResources.filter(resource => resourceIds.includes(resource.id));
};
