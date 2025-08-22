import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentsAPI } from '../../services/api';
import Table from '../common/Table';
import Card from '../common/Card';
import DateFilter from '../common/DateFilter';
import BaseFilter from '../common/BaseFilter';
import AssetTypeFilter from '../common/AssetTypeFilter';
import { format } from 'date-fns';

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    base: '',
    assetType: '',
    status: ''
  });

  useEffect(() => {
    loadAssignments();
  }, [filters]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '',
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '',
        base: filters.base,
        assetType: filters.assetType,
        status: filters.status
      };

      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await assignmentsAPI.getAll(params);
      console.log('Assignments response:', response.data);
      
      const assignmentsData = response.data.data || [];
      console.log('Processed assignments:', assignmentsData);
      
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
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

  const columns = [
    {
      header: 'Assignment ID',
      accessor: 'assignmentId'
    },
    {
      header: 'Asset',
      accessor: 'asset.name',
      cell: (assignment) => {
        return assignment.asset?.name || assignment.asset?.assetId || 'N/A';
      }
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo'
    },
    {
      header: 'Base',
      accessor: 'base.name',
      cell: (assignment) => assignment.base?.name || 'N/A'
    },
    {
      header: 'Quantity',
      accessor: 'quantity'
    },
    {
      header: 'Assignment Date',
      accessor: 'assignmentDate',
      cell: (assignment) => format(new Date(assignment.assignmentDate), 'MMM dd, yyyy')
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (assignment) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          assignment.status === 'active' 
            ? 'bg-green-100 text-green-800'
            : assignment.status === 'returned'
            ? 'bg-blue-100 text-blue-800'
            : assignment.status === 'expended'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {assignment.status?.charAt(0).toUpperCase() + assignment.status?.slice(1)}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (assignment) => (
        <div className="flex space-x-2">
          <Link
            to={`/assignments/view/${assignment._id}`}
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
        <h1 className="text-2xl font-bold text-gray-900">Asset Assignments</h1>
        <Link to="/assignments/new" className="btn-primary">
          New Assignment
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
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="expended">Expended</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={assignments}
          loading={loading}
          emptyMessage="No assignments found"
        />
      </Card>
    </div>
  );
};

export default AssignmentsList;