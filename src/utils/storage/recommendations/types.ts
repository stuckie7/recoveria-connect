
import { Resource } from '@/types';

/**
 * Types of recommendation sources
 */
export type RecommendationType = 
  | 'mood'               // Based on mood patterns
  | 'triggers'           // Based on frequent triggers
  | 'strategies'         // Based on unused strategies
  | 'general'            // General recommendations based on recovery stage
  | 'milestone'          // Milestone-related recommendations
  | 'education'          // Educational content
  | 'relapse-prevention' // Relapse prevention recommendations
;

/**
 * Recommendation object structure
 */
export interface Recommendation {
  id: string;                          // Unique identifier
  resourceIds: string[];               // IDs of recommended resources
  type: RecommendationType;            // Type of recommendation
  reason: string;                      // Reason for the recommendation
  action?: string;                     // Suggested action (optional)
  priority: number;                    // Priority score (1-10)
  createdAt: string;                   // ISO timestamp of creation
  expiresAt?: string;                  // Optional expiration date
}

/**
 * Helper function to get resources by IDs
 */
export const getResourcesByIds = (ids: string[], resources: Resource[]): Resource[] => {
  return resources.filter(resource => ids.includes(resource.id));
};
