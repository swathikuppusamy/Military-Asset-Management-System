import React, { useState, useEffect } from 'react';
import { basesAPI } from '../../services/api';

const BaseFilter = ({ filters, onChange }) => {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBases();
  }, []);

  const loadBases = async () => {
    try {
      const response = await basesAPI.getAll();
      
      // Handle different response structures
      let basesData = [];
      
      if (response.data && response.data.data) {
        // If API returns { status: 'success', data: [...] }
        basesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        // If API returns [...] directly
        basesData = response.data;
      } else if (response.data && Array.isArray(response.data.bases)) {
        // If API returns { bases: [...] }
        basesData = response.data.bases;
      }
      
      console.log('Bases data received:', basesData); // Debug log
      setBases(basesData);
    } catch (error) {
      console.error('Error loading bases:', error);
      setBases([]); // Ensure bases is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleBaseChange = (e) => {
    onChange({ base: e.target.value });
  };

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
        <div className="input-field bg-gray-100 animate-pulse h-10"></div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
      <select
        value={filters.base || ''}
        onChange={handleBaseChange}
        className="input-field"
      >
        <option value="">All Bases</option>
        {bases.length > 0 ? (
          bases.map((base) => (
            <option key={base._id || base.id} value={base._id || base.id}>
              {base.name}
            </option>
          ))
        ) : (
          <option disabled>No bases available</option>
        )}
      </select>
    </div>
  );
};

export default BaseFilter;