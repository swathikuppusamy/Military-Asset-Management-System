import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { transfersAPI, assetsAPI, basesAPI } from '../../services/api';
import Card from '../common/Card';

const TransferForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  const fromBase = watch('fromBase');
  const asset = watch('asset');

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (fromBase && asset) {
      checkAvailableQuantity();
    }
  }, [fromBase, asset]);

  const loadFormData = async () => {
    try {
      const [assetsResponse, basesResponse] = await Promise.all([
        assetsAPI.getAll(),
        basesAPI.getAll()
      ]);
      
      console.log('Assets Response:', assetsResponse.data);
      console.log('Bases Response:', basesResponse.data);
      
      const assetsData = assetsResponse.data?.data?.assets || [];
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      
      const basesData = basesResponse.data?.data || [];
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
      console.log('Single Asset Response:', response.data);
      
      const assetData = response.data?.data?.asset;
      const quantity = assetData?.currentQuantity || 0;
      
      console.log('Asset Data:', assetData);
      console.log('Available Quantity:', quantity);
      
      setAvailableQuantity(quantity);
    } catch (error) {
      console.error('Error checking available quantity:', error);
      setAvailableQuantity(0);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const transferData = {
        asset: data.asset,
        quantity: parseInt(data.quantity),
        toBase: data.toBase,
        notes: data.notes,
        priority: data.priority || 'medium'
      };
      
      console.log('Sending transfer data:', transferData);
      
      await transfersAPI.create(transferData);
      navigate('/transfers');
    } catch (error) {
      console.error('Error creating transfer:', error);
      const errorMessage = error.response?.data?.message || 'Error creating transfer. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Create Asset Transfer">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Base *
              </label>
              <select
                {...register('fromBase', { required: 'From base is required' })}
                className="input-field"
              >
                <option value="">Select From Base</option>
                {bases.map((base) => (
                  <option key={base._id} value={base._id}>
                    {base.name}
                  </option>
                ))}
              </select>
              {errors.fromBase && (
                <p className="text-red-600 text-sm mt-1">{errors.fromBase.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Base *
              </label>
              <select
                {...register('toBase', { required: 'To base is required' })}
                className="input-field"
              >
                <option value="">Select To Base</option>
                {bases.map((base) => (
                  <option key={base._id} value={base._id}>
                    {base.name}
                  </option>
                ))}
              </select>
              {errors.toBase && (
                <p className="text-red-600 text-sm mt-1">{errors.toBase.message}</p>
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
                    {asset.type?.name || 'Unknown Type'} - {asset.assetId} (Qty: {asset.currentQuantity})
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
                Transfer Date *
              </label>
              <input
                type="date"
                {...register('transferDate', { required: 'Transfer date is required' })}
                className="input-field"
              />
              {errors.transferDate && (
                <p className="text-red-600 text-sm mt-1">{errors.transferDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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
              placeholder="Additional notes about this transfer"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/transfers')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TransferForm;