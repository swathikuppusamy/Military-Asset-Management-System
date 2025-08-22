import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { assetsAPI, basesAPI, assetTypesAPI } from '../../services/api';
import Card from '../common/Card';

const AssetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [formDataLoading, setFormDataLoading] = useState(true);
  const [assetLoading, setAssetLoading] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (id && bases.length > 0 && assetTypes.length > 0) {
      loadAsset();
    }
  }, [id, bases.length, assetTypes.length]);

  const loadFormData = async () => {
    try {
      setFormDataLoading(true);
      const [basesResponse, typesResponse] = await Promise.all([
        basesAPI.getAll(),
        assetTypesAPI.getAll()
      ]);
      
      console.log('Bases Response:', basesResponse);
      console.log('Types Response:', typesResponse);
      
      let basesData = [];
      if (basesResponse?.data?.data?.bases) {
        basesData = basesResponse.data.data.bases;
      } else if (basesResponse?.data?.data && Array.isArray(basesResponse.data.data)) {
        basesData = basesResponse.data.data;
      } else if (basesResponse?.data && Array.isArray(basesResponse.data)) {
        basesData = basesResponse.data;
      }

      let typesData = [];
      if (typesResponse?.data?.data?.assetTypes) {
        typesData = typesResponse.data.data.assetTypes;
      } else if (typesResponse?.data?.data && Array.isArray(typesResponse.data.data)) {
        typesData = typesResponse.data.data;
      } else if (typesResponse?.data && Array.isArray(typesResponse.data)) {
        typesData = typesResponse.data;
      }
      
      setBases(Array.isArray(basesData) ? basesData : []);
      setAssetTypes(Array.isArray(typesData) ? typesData : []);
      
      console.log('Processed bases:', basesData);
      console.log('Processed asset types:', typesData);
    } catch (error) {
      console.error('Error loading form data:', error);
      setBases([]);
      setAssetTypes([]);
    } finally {
      setFormDataLoading(false);
    }
  };

  const loadAsset = async () => {
    try {
      setAssetLoading(true);
      console.log('Loading asset with ID:', id);
      
      const response = await assetsAPI.getById(id);
      console.log('Asset API Response:', response);
      
      const asset = response.data?.data?.asset || response.data?.asset || response.data;
      console.log('Extracted asset data:', asset);
      
      if (!asset) {
        console.error('No asset data found in response');
        alert('Asset not found');
        navigate('/assets');
        return;
      }

      setValue('assetId', asset.assetId || '');
      setValue('name', asset.name || '');
      setValue('currentQuantity', asset.currentQuantity || 0);
      setValue('status', asset.status || 'available');
      setValue('cost', asset.cost || '');
      setValue('specifications', asset.specifications || '');
      setValue('notes', asset.notes || '');
      
      if (asset.purchaseDate) {
        const date = new Date(asset.purchaseDate);
        const formattedDate = date.toISOString().split('T')[0];
        setValue('purchaseDate', formattedDate);
      }
      
      if (asset.type) {
        const typeId = typeof asset.type === 'object' ? asset.type._id : asset.type;
        setValue('type', typeId);
        console.log('Set type to:', typeId);
      }
      
      if (asset.base) {
        const baseId = typeof asset.base === 'object' ? asset.base._id : asset.base;
        setValue('base', baseId);
        console.log('Set base to:', baseId);
      }

      console.log('Form populated successfully');
    } catch (error) {
      console.error('Error loading asset:', error);
      if (error.response?.status === 404) {
        alert('Asset not found');
        navigate('/assets');
      } else {
        alert('Error loading asset data. Please try again.');
      }
    } finally {
      setAssetLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      console.log('Submitting form data:', data);
      
      const formData = {
        ...data,
        currentQuantity: parseInt(data.currentQuantity) || 0,
        cost: data.cost ? parseFloat(data.cost) : undefined
      };

      if (id) {
        await assetsAPI.update(id, formData);
        console.log('Asset updated successfully');
      } else {
        await assetsAPI.create(formData);
        console.log('Asset created successfully');
      }
      
      navigate('/assets');
    } catch (error) {
      console.error('Error saving asset:', error);
      const errorMessage = error.response?.data?.message || 'Error saving asset. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (formDataLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card title={id ? 'Edit Asset' : 'Add New Asset'}>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading form data...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (id && assetLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card title="Edit Asset">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading asset data...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card title={id ? 'Edit Asset' : 'Add New Asset'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset ID *
              </label>
              <input
                {...register('assetId', { required: 'Asset ID is required' })}
                className="input-field"
                placeholder="Enter asset ID"
              />
              {errors.assetId && (
                <p className="text-red-600 text-sm mt-1">{errors.assetId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                {...register('name')}
                className="input-field"
                placeholder="Enter asset name (optional)"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type *
              </label>
              <select
                {...register('type', { required: 'Asset type is required' })}
                className="input-field"
              >
                <option value="">Select Asset Type</option>
                {assetTypes && assetTypes.length > 0 ? (
                  assetTypes.map((type) => (
                    <option key={type._id || type.id} value={type._id || type.id}>
                      {type.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No asset types available</option>
                )}
              </select>
              {errors.type && (
                <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base *
              </label>
              <select
                {...register('base', { required: 'Base is required' })}
                className="input-field"
              >
                <option value="">Select Base</option>
                {bases && bases.length > 0 ? (
                  bases.map((base) => (
                    <option key={base._id || base.id} value={base._id || base.id}>
                      {base.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No bases available</option>
                )}
              </select>
              {errors.base && (
                <p className="text-red-600 text-sm mt-1">{errors.base.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Quantity *
              </label>
              <input
                type="number"
                {...register('currentQuantity', { 
                  required: 'Current quantity is required',
                  min: { value: 0, message: 'Quantity must be at least 0' }
                })}
                className="input-field"
                placeholder="Enter current quantity"
              />
              {errors.currentQuantity && (
                <p className="text-red-600 text-sm mt-1">{errors.currentQuantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="input-field"
              >
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
              {errors.status && (
                <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost
              </label>
              <input
                type="number"
                step="0.01"
                {...register('cost', { 
                  min: { value: 0, message: 'Cost must be at least 0' }
                })}
                className="input-field"
                placeholder="Enter cost"
              />
              {errors.cost && (
                <p className="text-red-600 text-sm mt-1">{errors.cost.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                {...register('purchaseDate')}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specifications
            </label>
            <textarea
              {...register('specifications')}
              rows={3}
              className="input-field"
              placeholder="Enter asset specifications"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="input-field"
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/assets')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : (id ? 'Update Asset' : 'Create Asset')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AssetForm;