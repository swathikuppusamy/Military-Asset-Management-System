import React, { useState } from 'react';

const MetricsCard = ({ title, value, icon, loading, detailView }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleCardClick = () => {
    if (detailView) {
      setShowDetails(!showDetails);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 relative ${detailView ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
          )}
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">
          {icon}
        </div>
      </div>

      {showDetails && detailView && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Movement Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-600">Purchases</span>
              <span className="font-medium">{formatNumber(detailView.purchases)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Transfers In</span>
              <span className="font-medium">{formatNumber(detailView.transfersIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Transfers Out</span>
              <span className="font-medium">{formatNumber(detailView.transfersOut)}</span>
            </div>
          </div>
        </div>
      )}

      {detailView && (
        <div className="absolute top-2 right-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;