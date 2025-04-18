
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const RefreshButton = () => {
  const handleRefresh = () => {
    toast.info('Refreshing app...');
    window.location.reload();
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="outline"
      size="icon"
      className="fixed bottom-4 left-4 z-50 rounded-full shadow-lg"
      title="Refresh app"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
};

export default RefreshButton;
