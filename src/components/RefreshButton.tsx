
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCheckIns } from '@/hooks/useCheckIns';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ className }) => {
  const { refreshCheckIns } = useCheckIns();

  const handleRefresh = async () => {
    toast.info('Refreshing app...');
    await refreshCheckIns();
    window.location.reload();
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full shadow-lg", 
        className
      )}
      title="Refresh app"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
};

export default RefreshButton;
