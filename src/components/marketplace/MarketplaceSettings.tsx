
import React from 'react';
import OzonSettings from './OzonSettings';
import WildberriesSettings from './WildberriesSettings';
import { useMarketplaceCredentials } from '@/hooks/useDatabase';

interface MarketplaceSettingsProps {
    handleCheckConnection: (marketplace: string, apiKey?: string) => Promise<void>;
    checkingConnection: string | null;
}

const MarketplaceSettings: React.FC<MarketplaceSettingsProps> = ({ handleCheckConnection, checkingConnection }) => {
    const { credentials, loading, saving, updateCredentialField, saveCredentials } = useMarketplaceCredentials();
    const ozonCreds = credentials['Ozon'] || {};
    const wbCreds = credentials['Wildberries'] || {};

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OzonSettings
                creds={ozonCreds}
                updateField={(field, value) => updateCredentialField('Ozon', field, value)}
                onCheckConnection={() => handleCheckConnection('Ozon', ozonCreds.api_key || '')}
                onSave={() => saveCredentials('Ozon')}
                loading={loading}
                saving={saving}
                checkingConnection={checkingConnection === 'Ozon'}
            />
            <WildberriesSettings
                creds={wbCreds}
                updateField={(field, value) => updateCredentialField('Wildberries', field, value)}
                onCheckConnection={() => handleCheckConnection('Wildberries', wbCreds.api_key || '')}
                onSave={() => saveCredentials('Wildberries')}
                loading={loading}
                saving={saving}
                checkingConnection={checkingConnection === 'Wildberries'}
            />
        </div>
    );
};

export default MarketplaceSettings;
