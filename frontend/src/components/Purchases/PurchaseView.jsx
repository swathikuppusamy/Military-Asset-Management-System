import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { purchasesAPI } from '../../services/api';
import Card from '../common/Card';
import { format } from 'date-fns';

const PurchaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadPurchase();
    }
  }, [id]);

  const loadPurchase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchasesAPI.getById(id);
      const purchaseData = response.data.data?.purchase || response.data.purchase || response.data;
      
      if (!purchaseData) {
        setError('Purchase not found');
        return;
      }
      
      setPurchase(purchaseData);
    } catch (error) {
      console.error('Error loading purchase:', error);
      setError(error.response?.data?.message || 'Error loading purchase data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card title="Purchase Details">
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading purchase details...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card title="Purchase Details">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => navigate('/purchases')}
              className="btn-secondary"
            >
              Back to Purchases
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card title="Purchase Details">
          <div className="text-center py-8">
            <div className="text-gray-600 mb-4">Purchase not found</div>
            <button
              onClick={() => navigate('/purchases')}
              className="btn-secondary"
            >
              Back to Purchases
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Details</h1>
        <button
          onClick={() => navigate('/purchases')}
          className="btn-secondary"
        >
          Back to Purchases
        </button>
      </div>

      {/* Main Purchase Information */}
      <Card title={`Purchase: ${purchase.purchaseId}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Asset Type
            </label>
            <p className="text-gray-900 font-semibold">
              {purchase.assetType?.name || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base/Location
            </label>
            <p className="text-gray-900 font-semibold">
              {purchase.base?.name || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <p className="text-gray-900 font-semibold">
              {formatDate(purchase.purchaseDate)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <p className="text-gray-900 font-semibold">
              {purchase.quantity || 0}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Cost
            </label>
            <p className="text-gray-900 font-semibold">
              {formatCurrency(purchase.unitCost)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Cost
            </label>
            <p className="text-gray-900 font-semibold text-lg">
              {formatCurrency(purchase.totalCost || (purchase.quantity * purchase.unitCost))}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <p className="text-gray-900 font-semibold">
              {purchase.supplier || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <p className="text-gray-900 font-semibold">
              {purchase.invoiceNumber || 'Not provided'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchased By
            </label>
            <p className="text-gray-900 font-semibold">
              {purchase.purchasedBy?.name || purchase.purchasedBy?.email || 'N/A'}
            </p>
          </div>
        </div>

        {purchase.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
              {purchase.notes}
            </p>
          </div>
        )}
      </Card>

      {/* Additional Information */}
      <Card title="Additional Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-gray-900">
              {purchase.createdAt ? formatDate(purchase.createdAt) : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-gray-900">
              {purchase.updatedAt ? formatDate(purchase.updatedAt) : 'N/A'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseView;