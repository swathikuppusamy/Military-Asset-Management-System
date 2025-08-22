import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expendituresAPI } from '../../services/api';
import Table from '../common/Table';
import Card from '../common/Card';
import DateFilter from '../common/DateFilter';
import BaseFilter from '../common/BaseFilter';
import AssetTypeFilter from '../common/AssetTypeFilter';
import { format } from 'date-fns';

const ExpendituresList = () => {
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    base: '',
    assetType: '',
    status: '',
    reason: ''
  });

  useEffect(() => {
    loadExpenditures();
  }, [filters]);

  const loadExpenditures = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '',
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '',
        base: filters.base,
        assetType: filters.assetType,
        status: filters.status,
        reason: filters.reason
      };

      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      console.log('Loading expenditures with params:', params);
      
      const response = await expendituresAPI.getAll(params);
      console.log('Full expenditures response:', response);
      console.log('Response data:', response.data);
      
      let expendituresData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          expendituresData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          expendituresData = response.data.data;
        } else if (response.data.expenditures && Array.isArray(response.data.expenditures)) {
          expendituresData = response.data.expenditures;
        } else if (response.data.data && response.data.data.expenditures && Array.isArray(response.data.data.expenditures)) {
          expendituresData = response.data.data.expenditures;
        } else {
          console.log('Unexpected response structure:', response.data);
          expendituresData = [];
        }
      }
      
      console.log('Processed expenditures data:', expendituresData);
      console.log('Expenditures count:', expendituresData.length);
      
      setExpenditures(expendituresData);
    } catch (error) {
      console.error('Error loading expenditures:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setExpenditures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status: status === 'all' ? '' : status }));
  };

  const handleReasonFilter = (reason) => {
    setFilters(prev => ({ ...prev, reason: reason === 'all' ? '' : reason }));
  };

  const getStatusColor = (approved) => {
    if (approved === true) {
      return 'bg-green-100 text-green-800';
    } else if (approved === false) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (approved) => {
    if (approved === true) {
      return 'Approved';
    } else if (approved === false) {
      return 'Rejected';
    } else {
      return 'Pending';
    }
  };

  const columns = [
    {
      header: 'Expenditure ID',
      accessor: '_id',
      cell: (expenditure) => expenditure._id.slice(-8).toUpperCase()
    },
    {
      header: 'Asset',
      accessor: 'asset.type.name',
      cell: (expenditure) => {
        return expenditure.asset?.type?.name || expenditure.asset?.name || 'N/A';
      }
    },
    {
      header: 'Asset ID',
      accessor: 'asset.assetId',
      cell: (expenditure) => expenditure.asset?.assetId || 'N/A'
    },
    {
      header: 'Base',
      accessor: 'base.name',
      cell: (expenditure) => expenditure.base?.name || 'N/A'
    },
    {
      header: 'Quantity',
      accessor: 'quantity'
    },
    {
      header: 'Reason',
      accessor: 'reason',
      cell: (expenditure) => (
        <span className="capitalize">{expenditure.reason}</span>
      )
    },
    {
      header: 'Expenditure Date',
      accessor: 'expendedDate',
      cell: (expenditure) => format(new Date(expenditure.expendedDate), 'MMM dd, yyyy')
    },
    {
      header: 'Status',
      accessor: 'approved',
      cell: (expenditure) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expenditure.approved)}`}>
          {getStatusText(expenditure.approved)}
        </span>
      )
    },
    {
      header: 'Expended By',
      accessor: 'expendedBy.username',
      cell: (expenditure) => expenditure.expendedBy?.username || expenditure.expendedBy?.name || 'N/A'
    },
    {
      header: 'Actions',
      cell: (expenditure) => (
        <div className="flex space-x-2">
          <Link
            to={`/expenditures/view/${expenditure._id}`}
            className="text-primary-600 hover:text-primary-900"
          >
            View
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Asset Expenditures</h1>
        <Link to="/expenditures/new" className="btn-primary">
          New Expenditure
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <DateFilter filters={filters} onChange={handleFilterChange} />
          <BaseFilter filters={filters} onChange={handleFilterChange} />
          <AssetTypeFilter filters={filters} onChange={handleFilterChange} />
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Reason Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select
              value={filters.reason}
              onChange={(e) => handleReasonFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Reasons</option>
              <option value="Training">Training</option>
              <option value="Operations">Operations</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Emergency">Emergency</option>
              <option value="Exercise">Exercise</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={expenditures}
          loading={loading}
          emptyMessage="No expenditures found"
        />
        
        
      </Card>
    </div>
  );
};

export default ExpendituresList;