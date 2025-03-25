
import { analyzeUnusedStrategies } from '../strategyAnalyzer';
import { testResources, createTestCheckIns, testStrategies } from './testUtils';

describe('Strategy Analyzer', () => {
  test('should recommend unused strategies', () => {
    // Create check-ins that only use strategy1
    const checkIns = createTestCheckIns(5, {});
    
    // Override strategies to only include strategy1
    checkIns.forEach(checkin => {
      checkin.strategies = ['strategy1'];
    });
    
    // Get recommendations
    const recommendations = analyzeUnusedStrategies(checkIns, testStrategies, testResources);
    
    // Verify recommendations
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].type).toBe('strategy');
    expect(recommendations[0].reason).toContain('haven\'t tried');
    expect(recommendations[0].priority).toBe(6);
  });
  
  test('should not give recommendations when all strategies are used', () => {
    // Create check-ins that use all strategies
    const checkIns = createTestCheckIns(5, {});
    
    // Add all strategy IDs to each check-in
    checkIns.forEach(checkin => {
      checkin.strategies = testStrategies.map(s => s.id);
    });
    
    // Get recommendations
    const recommendations = analyzeUnusedStrategies(checkIns, testStrategies, testResources);
    
    // Expect no recommendations since all strategies are used
    expect(recommendations.length).toBe(0);
  });
  
  test('should not give recommendations with no check-ins', () => {
    // Empty check-ins array
    const checkIns = [];
    
    // Get recommendations
    const recommendations = analyzeUnusedStrategies(checkIns, testStrategies, testResources);
    
    // Expect no recommendations due to no check-ins
    expect(recommendations.length).toBe(0);
  });
});
