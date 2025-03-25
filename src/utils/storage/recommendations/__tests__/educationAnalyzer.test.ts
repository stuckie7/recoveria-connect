
import { generateEducationalContent } from '../educationAnalyzer';
import { testResources, createTestCheckIns, createTestUserProgress } from './testUtils';

describe('Education Analyzer', () => {
  test('should generate educational recommendations for early recovery (0-30 days)', () => {
    // Create early recovery test data
    const checkIns = createTestCheckIns(5, { 
      moodPattern: 'mixed',
      commonTriggers: ['trigger1']
    });
    const progress = createTestUserProgress({ daysSince: 15, checkIns });
    
    // Get recommendations
    const recommendations = generateEducationalContent(progress, testResources);
    
    // Verify results
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].reason).toContain('foundation');
  });
  
  test('should generate educational recommendations for intermediate recovery', () => {
    // Create intermediate recovery test data
    const checkIns = createTestCheckIns(10, { 
      moodPattern: 'improving',
      commonTriggers: ['trigger1', 'trigger2']
    });
    const progress = createTestUserProgress({ daysSince: 60, checkIns });
    
    // Get recommendations
    const recommendations = generateEducationalContent(progress, testResources);
    
    // Verify results
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].reason).toContain('stage');
  });
  
  test('should generate educational recommendations for advanced recovery', () => {
    // Create advanced recovery test data
    const checkIns = createTestCheckIns(15, { 
      moodPattern: 'stable',
      commonTriggers: ['trigger1']
    });
    const progress = createTestUserProgress({ daysSince: 120, checkIns });
    
    // Get recommendations
    const recommendations = generateEducationalContent(progress, testResources);
    
    // Verify results
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].reason).toContain('long-term');
  });
  
  test('should handle empty check-ins', () => {
    // Create test data with no check-ins
    const progress = createTestUserProgress({ daysSince: 30, checkIns: [] });
    
    // Get recommendations
    const recommendations = generateEducationalContent(progress, testResources);
    
    // Verify results
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
