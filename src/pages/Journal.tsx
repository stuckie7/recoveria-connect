
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, PlusCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import JournalEntryList from '@/components/journal/JournalEntryList';
import JournalEntryForm from '@/components/journal/JournalEntryForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmergencySupport from '@/components/EmergencySupport';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchEntries();
    
    // Set up real-time listener for new entries
    const channel = supabase
      .channel('personal_journal_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_journal',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('personal_journal')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = () => {
    setCurrentEntry(null);
    setIsFormOpen(true);
  };

  const handleEditEntry = (entry: any) => {
    setCurrentEntry(entry);
    setIsFormOpen(true);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('personal_journal')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Journal entry deleted');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error('Failed to delete journal entry');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setCurrentEntry(null);
  };

  const handleFormSubmit = async (entry: any) => {
    try {
      if (currentEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('personal_journal')
          .update({
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentEntry.id);
        
        if (error) throw error;
        
        toast.success('Journal entry updated');
      } else {
        // Create new entry
        const { error } = await supabase
          .from('personal_journal')
          .insert({
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags,
            user_id: user?.id
          });
        
        if (error) throw error;
        
        toast.success('Journal entry created');
      }
      
      handleFormClose();
      fetchEntries();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error('Failed to save journal entry');
    }
  };

  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Book className="mr-2 h-6 w-6 text-primary" />
              Personal Journal
            </h1>
            <p className="text-muted-foreground mt-1">
              Document your thoughts, feelings, and recovery journey
            </p>
          </div>
          <Button onClick={handleCreateEntry} className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>

        <Tabs defaultValue="list" className="mb-6">
          <TabsList>
            <TabsTrigger value="list" onClick={() => setView('list')}>
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" onClick={() => setView('calendar')}>
              Calendar View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            <JournalEntryList 
              entries={entries}
              isLoading={isLoading}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4">
            <div className="glass-card p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Calendar View Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're working on a calendar view to help you visualize your journey.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {isFormOpen && (
          <JournalEntryForm
            entry={currentEntry}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        )}
      </div>
      
      <EmergencySupport />
    </div>
  );
};

export default Journal;
