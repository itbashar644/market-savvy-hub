
import React from 'react';
import { TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableTableHeaderProps {
  title: string;
  sortKey: string;
  currentSort: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  title,
  sortKey,
  currentSort,
  onSort,
}) => {
  const getSortIcon = () => {
    if (currentSort?.key !== sortKey) {
      return <ArrowUpDown className="w-3 h-3" />;
    }
    return currentSort.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3" />
      : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <TableHead>
      <Button
        variant="ghost"
        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
        onClick={() => onSort(sortKey)}
      >
        {title}
        <span className="ml-1">{getSortIcon()}</span>
      </Button>
    </TableHead>
  );
};

export default SortableTableHeader;
