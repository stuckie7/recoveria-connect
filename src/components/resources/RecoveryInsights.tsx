
import React, { useState } from 'react';
import { Lightbulb, ChevronRight, ChevronDown } from 'lucide-react';
import { Resource } from '@/types';
import { generateRecommendations, getResourcesByIds, Recommendation, RecommendationType } from '@/utils/storage/recommendations';
import PremiumFeature from '@/components/subscription/PremiumFeature';

interface RecoveryInsightsProps {
  resources: Resource[];
  onSelectResource: (resource: Resource) => void;
}

const RecoveryInsights: React.FC<RecoveryInsightsProps> = ({ resources, onSelectResource }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const recommendations = generateRecommendations(resources);
  
  // Group recommendations by type
  const groupedRecommendations: Record<RecommendationType, Recommendation[]> = {
    mood: [],
    triggers: [],
    strategy: [],
    general: [],
    education: [] // Added missing 'education' type
  };
  
  recommendations.forEach(rec => {
    groupedRecommendations[rec.type].push(rec);
  });
  
  // If no recommendations, don't render the component
  if (recommendations.length === 0) {
    return null;
  }
  
  const renderRecommendationGroup = (type: RecommendationType, title: string, isPremium: boolean = false) => {
    const recs = groupedRecommendations[type];
    if (recs.length === 0) return null;
    
    const recommendationContent = (
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        {recs.map(rec => (
          <div key={rec.id} className="glass-card p-3 mb-3">
            <p className="text-sm mb-2">{rec.reason}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {getResourcesByIds(rec.resources, resources).map(resource => (
                <button
                  key={resource.id}
                  onClick={() => onSelectResource(resource)}
                  className="px-3 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center transition-colors"
                >
                  <span>{resource.title.length > 20 ? resource.title.substring(0, 20) + '...' : resource.title}</span>
                  <ChevronRight size={14} className="ml-1" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );

    // If this is a premium feature, wrap it in the PremiumFeature component
    if (isPremium) {
      return (
        <PremiumFeature fallback={
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">{title} <span className="text-xs text-primary font-bold">(Premium)</span></h4>
            <div className="glass-card p-3 mb-3 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Upgrade to premium to access personalized {title.toLowerCase()}.
              </p>
            </div>
          </div>
        }>
          {recommendationContent}
        </PremiumFeature>
      );
    }
    
    return recommendationContent;
  };
  
  return (
    <div className="glass-card mb-6 overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-primary/20 mr-3">
            <Lightbulb size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Recovery Insights</h3>
            <p className="text-sm text-muted-foreground">Personalized recommendations based on your data</p>
          </div>
        </div>
        {isExpanded ? 
          <ChevronDown size={20} className="text-muted-foreground" /> : 
          <ChevronRight size={20} className="text-muted-foreground" />
        }
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in">
          {renderRecommendationGroup('general', 'General recommendations')}
          {renderRecommendationGroup('mood', 'Based on your mood trends', true)}
          {renderRecommendationGroup('triggers', 'Based on your triggers', true)}
          {renderRecommendationGroup('strategy', 'Suggested coping strategies', true)}
          {renderRecommendationGroup('education', 'Educational resources')}
        </div>
      )}
    </div>
  );
};

export default RecoveryInsights;
