
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface JournalEntryListProps {
  entries: any[];
  isLoading: boolean;
  onEdit: (entry: any) => void;
  onDelete: (id: string) => void;
}

const JournalEntryList: React.FC<JournalEntryListProps> = ({ 
  entries, 
  isLoading, 
  onEdit, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredEntries = React.useMemo(() => {
    if (!searchTerm.trim()) return entries;
    
    const term = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(term) || 
      entry.content.toLowerCase().includes(term) ||
      (entry.tags && entry.tags.some((tag: string) => tag.toLowerCase().includes(term)))
    );
  }, [entries, searchTerm]);

  // Get mood emoji based on mood value
  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'great': return '😄';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'poor': return '😔';
      case 'terrible': return '😢';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse glass-card">
            <CardHeader className="pb-2">
              <div className="h-6 bg-muted-foreground/20 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted-foreground/20 rounded w-full mb-2"></div>
              <div className="h-4 bg-muted-foreground/20 rounded w-4/5"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Search journal entries..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredEntries.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            {searchTerm ? (
              <>
                <p className="text-lg font-medium mb-2">No matching entries found</p>
                <p className="text-muted-foreground">Try a different search term</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">No journal entries yet</p>
                <p className="text-muted-foreground">Start documenting your journey</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="glass-card transition-all hover:shadow-md">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    {entry.title}
                  </CardTitle>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                    {entry.mood && (
                      <span className="flex items-center">
                        <span className="mr-1">{getMoodEmoji(entry.mood)}</span>
                        <span className="capitalize">{entry.mood}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(entry)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-muted-foreground text-sm">{entry.content}</p>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.tags.map((tag: string, index: number) => (
                      <span 
                        key={`${tag}-${index}`}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalEntryList;
