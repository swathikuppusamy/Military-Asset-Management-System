import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assetsAPI } from '../../services/api';
import Table from '../common/Table';
import Card from '../common/Card';
import BaseFilter from '../common/BaseFilter';
import AssetTypeFilter from '../common/AssetTypeFilter';

const AssetsList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    base: '',
    assetType: ''
  });

  useEffect(() => {
    loadAssets();
  }, [filters]);

  const loadAssets = async () => {
    try {
      setLoading(true);

      const filterParams = {};
      if (filters.base) filterParams.base = filters.base;
      if (filters.assetType) filterParams.type = filters.assetType; 

      console.log('Sending filter params:', filterParams); 

      const response = await assetsAPI.getAll(filterParams);

      console.log('Full API response:', response); 

      let assetsData = [];
      if (response.data && response.data.data && response.data.data.assets) {
        assetsData = response.data.data.assets;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        assetsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        assetsData = response.data;
      }

      console.log('Extracted assets data:', assetsData); 
      console.log('First asset sample:', assetsData[0]); 
      setAssets(assetsData);
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssets([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const columns = [
    {
      header: 'Asset ID',
      accessor: 'assetId',
      cell: (asset) => (
        <span className="text-gray-900">{asset.assetId || 'N/A'}</span>
      )
    },
    {
      header: 'Type',
      accessor: 'type.name',
      cell: (asset) => {
        if (asset.type && asset.type.name)
          return <span className="text-gray-900">{asset.type.name}</span>;
        if (typeof asset.type === 'string')
          return <span className="text-gray-900">{asset.type}</span>;
        return <span className="text-gray-500">N/A</span>;
      }
    },
    {
      header: 'Base',
      accessor: 'base.name',
      cell: (asset) => {
        if (asset.base && asset.base.name)
          return <span className="text-gray-900">{asset.base.name}</span>;
        if (typeof asset.base === 'string')
          return <span className="text-gray-900">{asset.base}</span>;
        return <span className="text-gray-500">N/A</span>;
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (asset) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            asset.status === 'available'
              ? 'bg-green-100 text-green-800'
              : asset.status === 'assigned'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {asset.status || 'unknown'}
        </span>
      )
    },
    {
      header: 'Quantity',
      accessor: 'currentQuantity',
      cell: (asset) => (
        <span className="text-gray-900">{asset.currentQuantity ?? '0'}</span>
      )
    },
    {
      header: 'Actions',
      cell: (asset) => (
        <div className="flex space-x-2">
          <Link
            to={`/assets/edit/${asset._id}`}
            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(asset._id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetsAPI.delete(id);
        loadAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assets Management</h1>
        <Link to="/assets/new" className="btn-primary">
          Add New Asset
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <BaseFilter filters={filters} onChange={handleFilterChange} />
          <AssetTypeFilter filters={filters} onChange={handleFilterChange} />
        </div>

        <Table
          columns={columns}
          data={assets}
          loading={loading}
          emptyMessage="No assets found"
        />
      </Card>
    </div>
  );
};

export default AssetsList;
