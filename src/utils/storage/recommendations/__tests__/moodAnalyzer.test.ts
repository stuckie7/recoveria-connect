
import { analyzeMoodPatterns } from '../moodAnalyzer';
import { testResources, createTestCheckIns } from './testUtils';

describe('Mood Analyzer', () => {
  test('should recommend resources for negative mood patterns', () => {
    // Create check-ins with mostly negative moods
    const checkIns = createTestCheckIns(10, { moodPattern: 'declining' });
    
    // Get recommendations
    const recommendations = analyzeMoodPatterns(checkIns, testResources);
    
    // Verify recommendations
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].type).toBe('mood');
    expect(recommendations[0].reason).toContain('lower moods');
    expect(recommendations[0].priority).toBeGreaterThanOrEqual(7);
  });
  
  test('should recommend resources for improving mood patterns', () => {
    // Create check-ins with improving moods
    const checkIns = createTestCheckIns(10, { moodPattern: 'improving' });
    
    // Get recommendations
    const recommendations = analyzeMoodPatterns(checkIns, testResources);
    
    // Check for positive momentum recommendations
    const positiveRecs = recommendations.filter(r => r.reason.includes('improving'));
    expect(positiveRecs.length).toBeGreaterThan(0);
  });
  
  test('should not give recommendations with insufficient data', () => {
    // Create only 2 check-ins
    const checkIns = createTestCheckIns(2, { moodPattern: 'declining' });
    
    // Get recommendations
    const recommendations = analyzeMoodPatterns(checkIns, testResources);
    
    // Expect no recommendations due to insufficient data
    expect(recommendations.length).toBe(0);
  });
});
