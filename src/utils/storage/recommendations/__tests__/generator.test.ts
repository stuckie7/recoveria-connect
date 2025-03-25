
import { generateRecommendations } from '../generator';
import { testResources, testTriggers, testStrategies, createTestCheckIns, createTestUserProgress } from './testUtils';

// Mock the storage utilities
jest.mock('@/utils/storage', () => ({
  getUserProgress: jest.fn(),
  getTriggers: jest.fn(),
  getCopingStrategies: jest.fn(),
}));

import { getUserProgress, getTriggers, getCopingStrategies } from '@/utils/storage';

describe('Recommendation Generator', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  test('should generate recommendations for established users', () => {
    // Create a user with sufficient data
    const checkIns = createTestCheckIns(15, {
      moodPattern: 'mixed',
      commonTriggers: ['trigger1']
    });
    const progress = createTestUserProgress({ daysSince: 45, checkIns });
    
    // Setup mocks - use type assertions to avoid TypeScript errors
    (getUserProgress as any).mockReturnValue(progress);
    (getTriggers as any).mockReturnValue(testTriggers);
    (getCopingStrategies as any).mockReturnValue(testStrategies);
    
    // Generate recommendations
    const recommendations = generateRecommendations(testResources);
    
    // Verify recommendations
    expect(recommendations.length).toBeGreaterThan(0);
    // Check if sorted by priority (highest first)
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].priority).toBeGreaterThanOrEqual(recommendations[i+1].priority);
    }
  });
  
  test('should include general recommendations for new users', () => {
    // Create a new user with minimal data
    const checkIns = createTestCheckIns(2, {});
    const progress = createTestUserProgress({ daysSince: 3, checkIns });
    
    // Setup mocks - use type assertions to avoid TypeScript errors
    (getUserProgress as any).mockReturnValue(progress);
    (getTriggers as any).mockReturnValue(testTriggers);
    (getCopingStrategies as any).mockReturnValue(testStrategies);
    
    // Generate recommendations
    const recommendations = generateRecommendations(testResources);
    
    // Verify general recommendations for new users
    expect(recommendations.length).toBeGreaterThan(0);
    const generalRecs = recommendations.filter(r => r.type === 'general');
    expect(generalRecs.length).toBeGreaterThan(0);
  });
  
  test('should handle empty check-ins gracefully', () => {
    // Create a user with no check-ins
    const progress = createTestUserProgress({ daysSince: 1, checkIns: [] });
    
    // Setup mocks - use type assertions to avoid TypeScript errors
    (getUserProgress as any).mockReturnValue(progress);
    (getTriggers as any).mockReturnValue(testTriggers);
    (getCopingStrategies as any).mockReturnValue(testStrategies);
    
    // Generate recommendations
    const recommendations = generateRecommendations(testResources);
    
    // Should still provide general recommendations
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some(r => r.type === 'general')).toBe(true);
  });
});
