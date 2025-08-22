import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { purchasesAPI } from '../../services/api';
import Table from '../common/Table';
import Card from '../common/Card';
import DateFilter from '../common/DateFilter';
import BaseFilter from '../common/BaseFilter';
import AssetTypeFilter from '../common/AssetTypeFilter';
import { format } from 'date-fns';

const PurchasesList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    base: '',
    assetType: ''
  });

  useEffect(() => {
    loadPurchases();
  }, [filters]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await purchasesAPI.getAll(filters);
      
      const purchasesData = response.data.data?.purchases || response.data.data || response.data || [];
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error loading purchases:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const columns = [
    {
      header: 'Purchase ID',
      accessor: 'purchaseId'
    },
    {
      header: 'Asset Type',
      accessor: 'assetType.name',
      cell: (purchase) => purchase.assetType?.name || 'N/A'
    },
    {
      header: 'Base',
      accessor: 'base.name',
      cell: (purchase) => purchase.base?.name || 'N/A'
    },
    {
      header: 'Quantity',
      accessor: 'quantity'
    },
    {
      header: 'Unit Cost',
      accessor: 'unitCost',
      cell: (purchase) => `$${purchase.unitCost?.toFixed(2) || '0.00'}`
    },
    {
      header: 'Total Cost',
      accessor: 'totalCost',
      cell: (purchase) => `$${(purchase.quantity * purchase.unitCost)?.toFixed(2) || '0.00'}`
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      cell: (purchase) => purchase.supplier || 'N/A'
    },
    {
      header: 'Purchase Date',
      accessor: 'purchaseDate',
      cell: (purchase) => {
        try {
          return format(new Date(purchase.purchaseDate), 'MMM dd, yyyy');
        } catch (error) {
          return 'Invalid Date';
        }
      }
    },
    {
      header: 'Purchased By',
      accessor: 'purchasedBy.name',
      cell: (purchase) => purchase.purchasedBy?.name || 'N/A'
    },
    {
      header: 'Actions',
      cell: (purchase) => (
        <div className="flex space-x-2">
          <Link
            to={`/purchases/view/${purchase._id}`}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
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
        <h1 className="text-2xl font-bold text-gray-900">Asset Purchases</h1>
        <Link to="/purchases/new" className="btn-primary">
          New Purchase
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <DateFilter filters={filters} onChange={handleFilterChange} />
          <BaseFilter filters={filters} onChange={handleFilterChange} />
          <AssetTypeFilter filters={filters} onChange={handleFilterChange} />
        </div>

        <Table
          columns={columns}
          data={purchases}
          loading={loading}
          emptyMessage="No purchases found"
        />
      </Card>
    </div>
  );
};

export default PurchasesList;