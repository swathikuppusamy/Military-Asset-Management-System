import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { purchasesAPI, assetTypesAPI, basesAPI } from '../../services/api';
import Card from '../common/Card';

const PurchaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from URL params for edit mode
  const isEditMode = Boolean(id);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [assetTypes, setAssetTypes] = useState([]);
  const [bases, setBases] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPurchase, setLoadingPurchase] = useState(false);

  const quantity = watch('quantity');
  const unitCost = watch('unitCost');

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadPurchase();
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (quantity && unitCost) {
      const total = quantity * unitCost;
      setValue('totalCost', total);
    }
  }, [quantity, unitCost, setValue]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [assetTypesResponse, basesResponse] = await Promise.all([
        assetTypesAPI.getAll(),
        basesAPI.getAll()
      ]);
      
      // Handle the nested data structure from API responses
      setAssetTypes(assetTypesResponse.data.data?.assetTypes || assetTypesResponse.data.data || assetTypesResponse.data || []);
      setBases(basesResponse.data.data?.bases || basesResponse.data.data || basesResponse.data || []);
    } catch (error) {
      console.error('Error loading form data:', error);
      // Set empty arrays as fallback
      setAssetTypes([]);
      setBases([]);
    } finally {
      setLoadingData(false);
    }
  };

      const loadPurchase = async () => {
    try {
      setLoadingPurchase(true);
      const response = await purchasesAPI.getById(id);
      const purchase = response.data.data?.purchase || response.data.purchase || response.data;
      
      // Populate form with existing purchase data
      const formData = {
        base: purchase.base?._id || purchase.base,
        assetType: purchase.assetType?._id || purchase.assetType,
        quantity: purchase.quantity,
        unitCost: purchase.unitCost,
        totalCost: purchase.totalCost || (purchase.quantity * purchase.unitCost),
        purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toISOString().split('T')[0] : '',
        supplier: purchase.supplier,
        invoiceNumber: purchase.invoiceNumber || '',
        notes: purchase.notes || ''
      };
      
      reset(formData);
    } catch (error) {
      console.error('Error loading purchase:', error);
      alert('Error loading purchase data. Please try again.');
      navigate('/purchases');
    } finally {
      setLoadingPurchase(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (isEditMode) {
        await purchasesAPI.update(id, data);
      } else {
        await purchasesAPI.create(data);
      }
      
      navigate('/purchases');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} purchase:`, error);
      alert(`Error ${isEditMode ? 'updating' : 'creating'} purchase. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || (isEditMode && loadingPurchase)) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card title={isEditMode ? "Edit Asset Purchase" : "Create Asset Purchase"}>
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">
              {loadingData ? 'Loading form data...' : 'Loading purchase data...'}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card title={isEditMode ? "Edit Asset Purchase" : "Create Asset Purchase"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base *
              </label>
              <select
                {...register('base', { required: 'Base is required' })}
                className="input-field"
              >
                <option value="">Select Base</option>
                {Array.isArray(bases) && bases.map((base) => (
                  <option key={base._id} value={base._id}>
                    {base.name}
                  </option>
                ))}
              </select>
              {errors.base && (
                <p className="text-red-600 text-sm mt-1">{errors.base.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type *
              </label>
              <select
                {...register('assetType', { required: 'Asset type is required' })}
                className="input-field"
              >
                <option value="">Select Asset Type</option>
                {Array.isArray(assetTypes) && assetTypes.map((assetType) => (
                  <option key={assetType._id} value={assetType._id}>
                    {assetType.name}
                  </option>
                ))}
              </select>
              {errors.assetType && (
                <p className="text-red-600 text-sm mt-1">{errors.assetType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' }
                })}
                className="input-field"
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('unitCost', { 
                  required: 'Unit cost is required',
                  min: { value: 0.01, message: 'Unit cost must be greater than 0' }
                })}
                className="input-field"
                placeholder="Enter unit cost"
              />
              {errors.unitCost && (
                <p className="text-red-600 text-sm mt-1">{errors.unitCost.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('totalCost')}
                className="input-field bg-gray-100"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                {...register('purchaseDate', { required: 'Purchase date is required' })}
                className="input-field"
              />
              {errors.purchaseDate && (
                <p className="text-red-600 text-sm mt-1">{errors.purchaseDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier *
              </label>
              <input
                {...register('supplier', { required: 'Supplier is required' })}
                className="input-field"
                placeholder="Enter supplier name"
              />
              {errors.supplier && (
                <p className="text-red-600 text-sm mt-1">{errors.supplier.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                {...register('invoiceNumber')}
                className="input-field"
                placeholder="Enter invoice number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input-field"
              placeholder="Additional notes about this purchase"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/purchases')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Purchase' : 'Create Purchase')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PurchaseForm;