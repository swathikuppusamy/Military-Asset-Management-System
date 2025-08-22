import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { expendituresAPI, assetsAPI, basesAPI } from '../../services/api';
import Card from '../common/Card';

const ExpenditureForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  const asset = watch('asset');

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (asset) {
      checkAvailableQuantity();
    }
  }, [asset]);

  const loadFormData = async () => {
    try {
      const [assetsResponse, basesResponse] = await Promise.all([
        assetsAPI.getAll(),
        basesAPI.getAll()
      ]);
      
      console.log('Assets response:', assetsResponse.data); 
      console.log('Bases response:', basesResponse.data); 
      
      const assetsData = assetsResponse.data?.data?.assets || assetsResponse.data?.data || assetsResponse.data || [];
      const basesData = basesResponse.data?.data?.bases || basesResponse.data?.data || basesResponse.data || [];
      
      console.log('Processed assets:', assetsData); 
      console.log('Processed bases:', basesData); 
      
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setBases(Array.isArray(basesData) ? basesData : []);
      
    } catch (error) {
      console.error('Error loading form data:', error);
      setAssets([]);
      setBases([]);
    }
  };

  const checkAvailableQuantity = async () => {
    try {
      const response = await assetsAPI.getById(asset);
      console.log('Asset quantity response:', response.data);
      
      const assetData = response.data?.data?.asset || response.data?.data || response.data;
      console.log('Asset data:', assetData); 
      
      setAvailableQuantity(assetData?.currentQuantity || 0);
    } catch (error) {
      console.error('Error checking available quantity:', error);
      setAvailableQuantity(0);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await expendituresAPI.create(data);
      navigate('/expenditures');
    } catch (error) {
      console.error('Error creating expenditure:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Create Asset Expenditure">
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
                {bases.map((base) => (
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
                Asset *
              </label>
              <select
                {...register('asset', { required: 'Asset is required' })}
                className="input-field"
              >
                <option value="">Select Asset</option>
                {assets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.type?.name || asset.name || 'Unknown'} ({asset.assetId})
                  </option>
                ))}
              </select>
              {errors.asset && (
                <p className="text-red-600 text-sm mt-1">{errors.asset.message}</p>
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
                  min: { value: 1, message: 'Quantity must be at least 1' },
                  max: { value: availableQuantity, message: `Quantity cannot exceed available ${availableQuantity}` }
                })}
                className="input-field"
                placeholder="Enter quantity"
              />
              <p className="text-sm text-gray-500 mt-1">
                Available: {availableQuantity}
              </p>
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <select
                {...register('reason', { required: 'Reason is required' })}
                className="input-field"
              >
                <option value="">Select Reason</option>
                <option value="Training">Training</option>
                <option value="Operations">Operations</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Emergency">Emergency</option>
                <option value="Exercise">Exercise</option>
                <option value="Other">Other</option>
              </select>
              {errors.reason && (
                <p className="text-red-600 text-sm mt-1">{errors.reason.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expenditure Date *
              </label>
              <input
                type="date"
                {...register('expendedDate', { required: 'Expenditure date is required' })}
                className="input-field"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              {errors.expendedDate && (
                <p className="text-red-600 text-sm mt-1">{errors.expendedDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description', {
                maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
              })}
              rows={3}
              className="input-field"
              placeholder="Enter description of expenditure"
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes', {
                maxLength: { value: 1000, message: 'Notes cannot exceed 1000 characters' }
              })}
              rows={3}
              className="input-field"
              placeholder="Additional notes about this expenditure"
              maxLength={1000}
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/expenditures')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Expenditure'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ExpenditureForm;