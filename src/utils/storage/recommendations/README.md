
# Recovery App Recommendation Engine

This directory contains the recommendation engine for the Recovery App.

## Overview

The recommendation engine analyzes user data and provides personalized resource recommendations based on:

- Mood patterns
- Frequent triggers
- Unused coping strategies
- General recovery stages

## Architecture

The engine is organized into separate analyzers:

- `moodAnalyzer.ts`: Detects patterns in user mood data
- `triggerAnalyzer.ts`: Identifies frequently reported triggers
- `strategyAnalyzer.ts`: Suggests unused coping strategies
- `generalAnalyzer.ts`: Provides stage-appropriate recommendations

These analyzers are coordinated by the main `generator.ts` which combines and prioritizes all recommendations.

## Testing

Each analyzer has its own test file in the `__tests__` directory:

- `moodAnalyzer.test.ts`
- `triggerAnalyzer.test.ts`
- `strategyAnalyzer.test.ts`
- `generalAnalyzer.test.ts`
- `generator.test.ts`

Use the test utilities in `testUtils.ts` to create test data for your own extensions.

## Extending the Recommendation Engine

To add new recommendation types:

1. Create a new analyzer file (e.g., `myNewAnalyzer.ts`)
2. Implement your analysis logic and return a `Recommendation[]` array
3. Add your analyzer to the `generateRecommendations` function in `generator.ts`
4. Write tests for your new analyzer

## Types

The main types are defined in `types.ts`:

- `RecommendationType`: The category of recommendation
- `Recommendation`: The structure of a recommendation object
