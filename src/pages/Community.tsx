
import React, { useState } from 'react';
import { MessageSquare, Heart, User, Search, Filter, Clock, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample data for community posts
const SAMPLE_POSTS = [
  {
    id: '1',
    title: '30 Days Sober!',
    username: 'Hopeful123',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: "I never thought I'd make it this far, but here I am. 30 days sober and feeling stronger than ever. The first two weeks were the hardest, but it gets easier. To anyone just starting out: stick with it, the clarity and peace are worth every difficult moment.",
    likes: 24,
    comments: 7,
    time: '2h ago',
    tags: ['milestone', 'encouragement']
  },
  {
    id: '2',
    title: 'Struggling with social events',
    username: 'JourneyToRecovery',
    avatar: 'https://i.pravatar.cc/150?img=2',
    content: 'How do you handle social gatherings where everyone is drinking? I have a wedding coming up and feeling anxious about being the only one not drinking. Any tips for handling the inevitable questions without making things awkward?',
    likes: 18,
    comments: 12,
    time: '5h ago',
    tags: ['advice', 'social']
  },
  {
    id: '3',
    title: 'Found a great therapist',
    username: 'NewBeginnings',
    avatar: 'https://i.pravatar.cc/150?img=3',
    content: "After trying a few different therapists, I finally found one who specializes in addiction recovery and it's making such a difference. If you're not clicking with your current therapist, don't give up on therapy altogether - keep looking for the right fit.",
    likes: 31,
    comments: 9,
    time: '12h ago',
    tags: ['therapy', 'resources']
  },
  {
    id: '4',
    title: 'One year sober today!',
    username: 'GratefulHeart',
    avatar: 'https://i.pravatar.cc/150?img=4',
    content: "I can't believe I'm writing this, but today marks one full year of sobriety. Looking back, I barely recognize the person I was. To anyone in their early days: it IS possible. Take it one day at a time, and before you know it, those days add up to something beautiful.",
    likes: 87,
    comments: 42,
    time: '1d ago',
    tags: ['milestone', 'celebration', 'oneyear']
  },
  {
    id: '5',
    title: 'Dealing with triggers',
    username: 'StepByStep',
    avatar: 'https://i.pravatar.cc/150?img=5',
    content: 'Had a really stressful day at work and the urge to drink hit me hard. Instead, I went for a long run, took a hot shower, and called my sponsor. It worked, but these moments still scare me. How do you all deal with unexpected, strong triggers?',
    likes: 14,
    comments: 21,
    time: '1d ago',
    tags: ['triggers', 'coping', 'advice']
  }
];

type SortOption = 'recent' | 'popular' | 'trending';
type FilterOption = 'all' | 'questions' | 'stories' | 'resources';

const Community: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter and sort posts
  const filteredPosts = SAMPLE_POSTS
    .filter(post => {
      // Apply search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          post.title.toLowerCase().includes(searchLower) || 
          post.content.toLowerCase().includes(searchLower) ||
          post.username.toLowerCase().includes(searchLower) ||
          post.tags.some(tag => tag.includes(searchLower))
        );
      }
      return true;
    })
    .filter(post => {
      // Apply category filter
      if (filterBy === 'all') return true;
      if (filterBy === 'questions' && post.title.includes('?')) return true;
      if (filterBy === 'stories' && post.tags.includes('milestone')) return true;
      if (filterBy === 'resources' && post.tags.includes('resources')) return true;
      return false;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'recent') {
        return 0; // Already sorted by recent in our data
      }
      if (sortBy === 'popular') {
        return b.likes - a.likes;
      }
      if (sortBy === 'trending') {
        return (b.likes + b.comments) - (a.likes + a.comments);
      }
      return 0;
    });
  
  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">Community</h1>
        <p className="text-muted-foreground mb-6 text-center lg:text-left">
          Connect with others on the recovery journey
        </p>
        
        {/* Search and filter */}
        <div className="glass-card mb-6">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl neo-input"
                />
              </div>
              
              {/* Filter button */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:w-auto w-full flex items-center justify-center space-x-2 px-4 py-2 neo-button"
              >
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>
            
            {/* Filter options */}
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Sort options */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Sort by</h4>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSortBy('recent')}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm",
                          sortBy === 'recent' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        <Clock size={14} className="mr-1.5" />
                        Recent
                      </button>
                      
                      <button 
                        onClick={() => setSortBy('popular')}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm",
                          sortBy === 'popular' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        <Heart size={14} className="mr-1.5" />
                        Popular
                      </button>
                      
                      <button 
                        onClick={() => setSortBy('trending')}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm",
                          sortBy === 'trending' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        <TrendingUp size={14} className="mr-1.5" />
                        Trending
                      </button>
                    </div>
                  </div>
                  
                  {/* Filter options */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Filter by</h4>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setFilterBy('all')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm",
                          filterBy === 'all' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        All
                      </button>
                      
                      <button 
                        onClick={() => setFilterBy('questions')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm",
                          filterBy === 'questions' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        Questions
                      </button>
                      
                      <button 
                        onClick={() => setFilterBy('stories')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm",
                          filterBy === 'stories' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        Success Stories
                      </button>
                      
                      <button 
                        onClick={() => setFilterBy('resources')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm",
                          filterBy === 'resources' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        Resources
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Community stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-recovery-blue flex items-center justify-center mr-3">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Active Members</h4>
              <p className="text-2xl font-semibold">3,298</p>
            </div>
          </div>
          
          <div className="glass-card p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-recovery-green-dark flex items-center justify-center mr-3">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Discussions</h4>
              <p className="text-2xl font-semibold">1,452</p>
            </div>
          </div>
          
          <div className="glass-card p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Online Now</h4>
              <p className="text-2xl font-semibold">324</p>
            </div>
          </div>
        </div>
        
        {/* Posts list */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="glass-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 animate-fade-in"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img 
                          src={post.avatar} 
                          alt={post.username} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{post.username}</h3>
                        <span className="text-xs text-muted-foreground">{post.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  
                  <p className="text-foreground/80 mb-4">{post.content}</p>
                  
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-muted-foreground hover:text-rose-500 transition-colors">
                        <Heart size={18} className="mr-1" />
                        <span>{post.likes}</span>
                      </button>
                      
                      <button className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <MessageSquare size={18} className="mr-1" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                    
                    <button className="text-sm text-primary hover:underline">
                      View Discussion
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No matches found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
        
        {/* Create post button */}
        <div className="fixed bottom-24 right-4 z-30">
          <button className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-primary text-white">
            <MessageSquare size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Community;
