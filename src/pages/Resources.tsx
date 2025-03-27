import React, { useState, useEffect } from 'react';
import { Resource } from '@/types';
import RecoveryInsights from '@/components/resources/RecoveryInsights';
import SearchAndFilter from '@/components/resources/SearchAndFilter';
import ResourceGrid from '@/components/resources/ResourceGrid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type ResourceType = 'all' | 'article' | 'video' | 'audio' | 'exercise';

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('recovery_resources')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedResources: Resource[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type as 'article' | 'video' | 'audio' | 'exercise',
            url: item.url,
            imageUrl: item.image_url || 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            tags: item.tags || [],
            duration: item.duration || '',
          }));
          
          setResources(formattedResources);
          
          const tags = Array.from(
            new Set(formattedResources.flatMap(resource => resource.tags))
          ).sort();
          
          setAllTags(tags);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: "Error loading resources",
          description: "Could not load resources from the database. Using sample data instead.",
          variant: "destructive",
        });
        
        useSampleData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
    
    const resourcesSubscription = supabase
      .channel('recovery_resources_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'recovery_resources' 
      }, (payload) => {
        console.log('Realtime update:', payload);
        fetchResources();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(resourcesSubscription);
    };
  }, [toast]);
  
  const useSampleData = () => {
    const SAMPLE_RESOURCES: Resource[] = [
      {
        id: '1',
        title: 'Understanding Addiction: The Science Behind Recovery',
        description: 'Learn about the neuroscience of addiction and how understanding your brain can help your recovery journey.',
        type: 'article',
        url: 'https://www.verywellmind.com/the-science-of-addiction-22424',
        imageUrl: 'https://images.unsplash.com/photo-1579165466741-7f35e4755169?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['science', 'education', 'beginner'],
        duration: '10 min read'
      },
      {
        id: '2',
        title: 'Guided Meditation for Cravings',
        description: 'A calming meditation practice specifically designed to help you through moments of intense cravings.',
        type: 'audio',
        url: 'https://www.youtube.com/watch?v=4EaMJOo1jks',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['meditation', 'coping', 'audio'],
        duration: '15 min listen'
      },
      {
        id: '3',
        title: 'Rebuilding Relationships in Recovery',
        description: 'Practical advice on how to repair and strengthen relationships that may have been damaged during addiction.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=RpzJ-lSMuxo',
        imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['relationships', 'healing', 'video'],
        duration: '22 min watch'
      },
      {
        id: '4',
        title: 'CBT Skills Workbook',
        description: 'Interactive exercises to develop cognitive behavioral therapy skills for managing triggers and negative thoughts.',
        type: 'exercise',
        url: 'https://www.therapistaid.com/therapy-worksheets/cbt/none',
        imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['cbt', 'exercise', 'tools'],
        duration: '45 min activity'
      },
      {
        id: '5',
        title: 'Nutrition for Recovery: Healing Your Body',
        description: 'How proper nutrition can support physical healing and stabilize mood during recovery.',
        type: 'article',
        url: 'https://www.healthline.com/nutrition/nutrition-and-addiction-recovery',
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['nutrition', 'health', 'self-care'],
        duration: '12 min read'
      },
      {
        id: '6',
        title: 'Finding Purpose After Addiction',
        description: 'Stories and strategies for discovering new meaning and purpose in your life after addiction.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=UUnRKf2CemA',
        imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['purpose', 'motivation', 'success-stories'],
        duration: '18 min watch'
      }
    ];
    
    setResources(SAMPLE_RESOURCES);
    
    const tags = Array.from(
      new Set(SAMPLE_RESOURCES.flatMap(resource => resource.tags))
    ).sort();
    
    setAllTags(tags);
  };
  
  const filteredResources = resources.filter(resource => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  }).filter(resource => {
    if (selectedType !== 'all') {
      return resource.type === selectedType;
    }
    return true;
  }).filter(resource => {
    if (selectedTags.length > 0) {
      return selectedTags.some(tag => resource.tags.includes(tag));
    }
    return true;
  });

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    const resourceElement = document.getElementById(`resource-${resource.id}`);
    if (resourceElement) {
      resourceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      resourceElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        resourceElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  };
  
  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">
          Learning Resources
        </h1>
        <p className="text-muted-foreground mb-6 text-center lg:text-left">
          Educational materials to support your recovery journey
        </p>
        
        {resources.length > 0 && !loading && (
          <div className="text-sm text-muted-foreground mb-6 text-center">
            <span>Resources are updated daily with fresh content</span>
          </div>
        )}
        
        <RecoveryInsights 
          resources={resources} 
          onSelectResource={handleResourceSelect} 
          loading={loading}
        />
        
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          allTags={allTags}
        />
        
        <ResourceGrid
          resources={filteredResources}
          selectedResource={selectedResource}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Resources;
