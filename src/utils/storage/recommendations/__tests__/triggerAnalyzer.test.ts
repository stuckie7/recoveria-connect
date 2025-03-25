
import { analyzeFrequentTriggers } from '../triggerAnalyzer';
import { testResources, createTestCheckIns, testTriggers } from './testUtils';

describe('Trigger Analyzer', () => {
  test('should identify frequent triggers and provide relevant recommendations', () => {
    // Create check-ins with common triggers
    const checkIns = createTestCheckIns(10, { 
      commonTriggers: ['trigger1', 'trigger1', 'trigger1'] 
    });
    
    // Get recommendations
    const recommendations = analyzeFrequentTriggers(checkIns, testTriggers, testResources);
    
    // Verify recommendations
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].type).toBe('triggers');
    expect(recommendations[0].priority).toBeGreaterThanOrEqual(7);
  });
  
  test('should not give recommendations with insufficient trigger data', () => {
    // Create check-ins with no common triggers
    const checkIns = createTestCheckIns(5, { commonTriggers: [] });
    
    // Get recommendations
    const recommendations = analyzeFrequentTriggers(checkIns, testTriggers, testResources);
    
    // Expect no recommendations due to insufficient trigger data
    expect(recommendations.length).toBe(0);
  });
  
  test('should not give recommendations with insufficient check-ins', () => {
    // Create only 1 check-in
    const checkIns = createTestCheckIns(1, { commonTriggers: ['trigger1'] });
    
    // Get recommendations
    const recommendations = analyzeFrequentTriggers(checkIns, testTriggers, testResources);
    
    // Expect no recommendations due to insufficient check-ins
    expect(recommendations.length).toBe(0);
  });
});
