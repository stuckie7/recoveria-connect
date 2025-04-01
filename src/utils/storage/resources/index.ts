
import { Resource } from '@/types';

/**
 * Mock resources data for development and testing
 */
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

/**
 * Get all available resources
 */
export const getResources = (): Resource[] => {
  // In a real app, this would fetch from an API or local storage
  // For now, we'll return sample data
  return SAMPLE_RESOURCES;
};

/**
 * Filter resources by various criteria
 */
export const filterResources = (
  resources: Resource[],
  options: {
    type?: string;
    tags?: string[];
    searchTerm?: string;
  }
): Resource[] => {
  return resources.filter(resource => {
    // Filter by type
    if (options.type && options.type !== 'all' && resource.type !== options.type) {
      return false;
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      if (!resource.tags.some(tag => options.tags!.includes(tag))) {
        return false;
      }
    }

    // Filter by search term
    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      return (
        resource.title.toLowerCase().includes(term) ||
        resource.description.toLowerCase().includes(term) ||
        resource.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return true;
  });
};
