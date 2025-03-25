
import { addGeneralRecommendations } from '../generalAnalyzer';
import { testResources, createTestUserProgress, createTestCheckIns } from './testUtils';

describe('General Analyzer', () => {
  test('should provide beginner recommendations for new users', () => {
    // Create a new user (less than 7 days)
    const checkIns = createTestCheckIns(3, {});
    const progress = createTestUserProgress({ daysSince: 5, checkIns });
    
    // Get recommendations
    const recommendations = addGeneralRecommendations(progress, testResources);
    
    // Verify beginner recommendations
    const beginnerRecs = recommendations.filter(r => r.id === 'general-beginner');
    expect(beginnerRecs.length).toBe(1);
    expect(beginnerRecs[0].priority).toBe(10);
  });
  
  test('should provide early recovery recommendations for users between 7-90 days', () => {
    // Create an early recovery user (30 days)
    const checkIns = createTestCheckIns(15, {});
    const progress = createTestUserProgress({ daysSince: 30, checkIns });
    
    // Get recommendations
    const recommendations = addGeneralRecommendations(progress, testResources);
    
    // Verify early recovery recommendations
    const earlyRecs = recommendations.filter(r => r.id === 'general-early');
    expect(earlyRecs.length).toBe(1);
  });
  
  test('should provide sustained recovery recommendations for users with 90+ days', () => {
    // Create a sustained recovery user (100 days)
    const checkIns = createTestCheckIns(20, {});
    const progress = createTestUserProgress({ daysSince: 100, checkIns });
    
    // Get recommendations
    const recommendations = addGeneralRecommendations(progress, testResources);
    
    // Verify sustained recovery recommendations
    const sustainedRecs = recommendations.filter(r => r.id === 'general-sustained');
    expect(sustainedRecs.length).toBe(1);
  });
  
  test('should always include self-care recommendations', () => {
    // Create any user
    const checkIns = createTestCheckIns(5, {});
    const progress = createTestUserProgress({ daysSince: 20, checkIns });
    
    // Get recommendations
    const recommendations = addGeneralRecommendations(progress, testResources);
    
    // Verify self-care recommendations
    const selfCareRecs = recommendations.filter(r => r.id === 'general-selfcare');
    expect(selfCareRecs.length).toBe(1);
  });
});
