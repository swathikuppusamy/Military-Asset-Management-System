import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transfersAPI, basesAPI } from '../../services/api';
import Table from '../common/Table';
import Card from '../common/Card';
import DateFilter from '../common/DateFilter';
import AssetTypeFilter from '../common/AssetTypeFilter';
import { format } from 'date-fns';

const TransfersList = () => {
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    fromBase: '',
    toBase: '',
    assetType: '',
    status: ''
  });

  useEffect(() => {
    loadBases();
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [filters]);

  const loadBases = async () => {
    try {
      const response = await basesAPI.getAll();
      
      let basesData = [];
      if (response.data && response.data.data) {
        basesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        basesData = response.data;
      } else if (response.data && Array.isArray(response.data.bases)) {
        basesData = response.data.bases;
      }
      
      setBases(basesData);
    } catch (error) {
      console.error('Error loading bases:', error);
      setBases([]);
    }
  };

  const loadTransfers = async () => {
    try {
      setLoading(true);
      
      const filterParams = {};
      
      if (filters.fromBase && filters.fromBase !== '') {
        filterParams.fromBase = filters.fromBase;
      }
      if (filters.toBase && filters.toBase !== '') {
        filterParams.toBase = filters.toBase;
      }
      if (filters.assetType && filters.assetType !== '') {
        filterParams.assetType = filters.assetType;
      }
      if (filters.status && filters.status !== '') {
        filterParams.status = filters.status;
      }
      if (filters.startDate) {
        filterParams.startDate = filters.startDate.toISOString();
      }
      if (filters.endDate) {
        filterParams.endDate = filters.endDate.toISOString();
      }
      
      const response = await transfersAPI.getAll(filterParams);
      
      let transfersData = [];
      if (response.data && response.data.data && response.data.data.transfers) {
        transfersData = response.data.data.transfers;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        transfersData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        transfersData = response.data;
      }
      
      setTransfers(transfersData);
    } catch (error) {
      console.error('Error loading transfers:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      fromBase: '',
      toBase: '',
      assetType: '',
      status: ''
    });
  };

  const handleApprove = async (transferId) => {
    try {
      await transfersAPI.approve(transferId);
      loadTransfers();
    } catch (error) {
      console.error('Error approving transfer:', error);
      alert('Error approving transfer. Please try again.');
    }
  };

  const handleReject = async (transferId) => {
    if (window.confirm('Are you sure you want to reject this transfer?')) {
      try {
        await transfersAPI.reject(transferId);
        loadTransfers(); 
      } catch (error) {
        console.error('Error rejecting transfer:', error);
        alert('Error rejecting transfer. Please try again.');
      }
    }
  };

  const handleCancel = async (transferId) => {
    if (window.confirm('Are you sure you want to cancel this transfer?')) {
      try {
        await transfersAPI.cancel(transferId);
        loadTransfers();
      } catch (error) {
        console.error('Error cancelling transfer:', error);
        alert('Error cancelling transfer. Please try again.');
      }
    }
  };

  const columns = [
    {
      header: 'Asset',
      cell: (transfer) => (
        <div>
          <div className="font-medium text-gray-900">
            {transfer.asset?.type?.name || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {transfer.asset?.type?.name || 'Unknown Type'}
          </div>
        </div>
      )
    },
    {
      header: 'From',
      cell: (transfer) => (
        <span className="text-gray-900">
          {transfer.fromBase?.name || 'N/A'}
        </span>
      )
    },
    {
      header: 'To',
      cell: (transfer) => (
        <span className="text-gray-900">
          {transfer.toBase?.name || 'N/A'}
        </span>
      )
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      cell: (transfer) => (
        <span className="font-medium">
          {transfer.quantity || 0}
        </span>
      )
    },
    {
      header: 'Status',
      cell: (transfer) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          transfer.status === 'completed' 
            ? 'bg-green-100 text-green-800'
            : transfer.status === 'approved'
            ? 'bg-blue-100 text-blue-800'
            : transfer.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : transfer.status === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {transfer.status === 'completed' ? 'Completed' :
           transfer.status === 'approved' ? 'Approved' :
           transfer.status === 'pending' ? 'Pending' :
           transfer.status === 'rejected' ? 'Rejected' :
           'Unknown'}
        </span>
      )
    },
    {
      header: 'Date',
      cell: (transfer) => {
        const dateToShow = transfer.transferDate || transfer.createdAt;
        if (dateToShow) {
          return (
            <span className="text-gray-900">
              {format(new Date(dateToShow), 'MMM dd, yyyy')}
            </span>
          );
        }
        return 'N/A';
      }
    },
    {
      header: 'Actions',
      cell: (transfer) => (
        <div className="flex items-center space-x-3">
          <Link
            to={`/transfers/view/${transfer._id}`}
            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            View
          </Link>
          {transfer.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(transfer._id)}
                className="text-green-600 hover:text-green-900 text-sm font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(transfer._id)}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Asset Transfers</h1>
        <Link to="/transfers/new" className="btn-primary">
          New Transfer
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <DateFilter filters={filters} onChange={handleFilterChange} />
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* From Base Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Base</label>
            <select
              value={filters.fromBase || ''}
              onChange={(e) => handleFilterChange({ fromBase: e.target.value })}
              className="input-field"
            >
              <option value="">All Bases</option>
              {bases.map((base) => (
                <option key={base._id || base.id} value={base._id || base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          {/* To Base Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Base</label>
            <select
              value={filters.toBase || ''}
              onChange={(e) => handleFilterChange({ toBase: e.target.value })}
              className="input-field"
            >
              <option value="">All Bases</option>
              {bases.map((base) => (
                <option key={base._id || base.id} value={base._id || base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <AssetTypeFilter filters={filters} onChange={handleFilterChange} />

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active filters summary */}
        {(filters.fromBase || filters.toBase || filters.assetType || filters.status) && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Active filters: </span>
              {filters.status && (
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                  Status: {filters.status}
                </span>
              )}
              {filters.fromBase && (
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                  From: {bases.find(b => (b._id || b.id) === filters.fromBase)?.name || 'Unknown'}
                </span>
              )}
              {filters.toBase && (
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                  To: {bases.find(b => (b._id || b.id) === filters.toBase)?.name || 'Unknown'}
                </span>
              )}
              {filters.assetType && (
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                  Asset Type: {filters.assetType}
                </span>
              )}
            </div>
          </div>
        )}

        <Table
          columns={columns}
          data={transfers}
          loading={loading}
          emptyMessage="No transfers found matching the current filters"
        />
        
        
      </Card>
    </div>
  );
};

export default TransfersList;
