
import React from 'react';
import MarketplaceCard from './MarketplaceCard';
import { Marketplace } from '@/types/marketplace';

interface MarketplaceGridProps {
  marketplaces: Marketplace[];
  onSync: (name: string) => void;
  onShowProducts: (name: string) => void;
  onSettingsClick: (name: string) => void;
  syncInProgress: boolean;
  syncingMarketplace: string | null;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  marketplaces,
  onSync,
  onShowProducts,
  onSettingsClick,
  syncInProgress,
  syncingMarketplace
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {marketplaces.map((marketplace) => (
        <MarketplaceCard 
          key={marketplace.name}
          marketplace={marketplace}
          onSync={onSync}
          onShowProducts={onShowProducts}
          onSettingsClick={onSettingsClick}
          syncInProgress={syncInProgress}
          syncingMarketplace={syncingMarketplace}
        />
      ))}
    </div>
  );
};

export default MarketplaceGrid;
