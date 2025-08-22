import React, { useState, useEffect } from 'react';
import { assetTypesAPI } from '../../services/api';

const AssetTypeFilter = ({ filters, onChange }) => {
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssetTypes();
  }, []);

  const loadAssetTypes = async () => {
    try {
      const response = await assetTypesAPI.getAll();
      
      // Handle different response structures (same pattern as BaseFilter)
      let assetTypesData = [];
      
      if (response.data && response.data.data) {
        // If API returns { status: 'success', data: [...] }
        assetTypesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        // If API returns [...] directly
        assetTypesData = response.data;
      } else if (response.data && Array.isArray(response.data.assetTypes)) {
        // If API returns { assetTypes: [...] }
        assetTypesData = response.data.assetTypes;
      }
      
      console.log('Asset types data received:', assetTypesData); // Debug log
      setAssetTypes(assetTypesData);
    } catch (error) {
      console.error('Error loading asset types:', error);
      setAssetTypes([]); // Ensure assetTypes is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleAssetTypeChange = (e) => {
    onChange({ assetType: e.target.value });
  };

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
        <div className="input-field bg-gray-100 animate-pulse h-10"></div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
      <select
        value={filters.assetType || ''}
        onChange={handleAssetTypeChange}
        className="input-field"
      >
        <option value="">All Types</option>
        {assetTypes.length > 0 ? (
          assetTypes.map((type) => (
            <option key={type._id || type.id} value={type._id || type.id}>
              {type.name}
            </option>
          ))
        ) : (
          <option disabled>No asset types available</option>
        )}
      </select>
    </div>
  );
};

export default AssetTypeFilter;