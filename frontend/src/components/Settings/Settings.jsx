import React, { useState } from 'react';
import Card from '../common/Card';
import GeneralSettings from './GeneralSettings';
import AssetTypes from './AssetTypes';
import Bases from './Bases';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', component: GeneralSettings },
    { id: 'asset-types', name: 'Asset Types', component: AssetTypes },
    { id: 'bases', name: 'Bases', component: Bases }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      </div>

      <Card>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </Card>
    </div>
  );
};

export default Settings;