
import React from 'react';
import { Search } from 'lucide-react';

interface CommunitySearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CommunitySearch: React.FC<CommunitySearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
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
  );
};

export default CommunitySearch;
