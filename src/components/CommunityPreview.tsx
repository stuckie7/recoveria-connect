
import React from 'react';
import { MessageSquare, Heart, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Sample community posts for preview
const samplePosts = [
  {
    id: '1',
    title: '30 Days Sober!',
    username: 'Hopeful123',
    avatar: 'https://i.pravatar.cc/150?u=1',
    content: "I never thought I'd make it this far, but here I am. 30 days sober and feeling stronger than ever.",
    likes: 24,
    comments: 7,
    time: '2h ago'
  },
  {
    id: '2',
    title: 'Struggling with social events',
    username: 'JourneyToRecovery',
    avatar: 'https://i.pravatar.cc/150?u=2',
    content: 'How do you handle social gatherings where everyone is drinking? I have a wedding coming up and feeling anxious.',
    likes: 18,
    comments: 12,
    time: '5h ago'
  }
];

const CommunityPreview: React.FC = () => {
  return (
    <div className="neo-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Community Support</h3>
        
        <Link 
          to="/community" 
          className="text-sm text-primary flex items-center hover:underline"
        >
          View all <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {samplePosts.map((post, index) => (
          <div 
            key={post.id} 
            className={cn(
              "glass-card overflow-hidden transition-all",
              "hover:shadow-lg hover:border-primary/30",
              "animate-slide-in-bottom",
              { "animation-delay-100": index === 0 },
              { "animation-delay-200": index === 1 },
            )}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={post.avatar} alt={post.username} />
                    <AvatarFallback>{post.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{post.title}</h4>
                    <div className="text-xs text-muted-foreground">
                      by <span className="text-foreground">{post.username}</span> · {post.time}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm mb-3 line-clamp-2">{post.content}</p>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <div className="flex items-center mr-4">
                  <Heart size={14} className="mr-1 text-rose-400" />
                  {post.likes}
                </div>
                
                <div className="flex items-center">
                  <MessageSquare size={14} className="mr-1 text-primary" />
                  {post.comments}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-muted rounded-xl flex items-center justify-center text-sm">
        <Users size={16} className="mr-2 text-primary" />
        <span>324 members online</span>
      </div>
    </div>
  );
};

export default CommunityPreview;
