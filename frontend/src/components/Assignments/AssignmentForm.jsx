import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { assignmentsAPI, assetsAPI, basesAPI } from '../../services/api';
import Card from '../common/Card';

const AssignmentForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  const base = watch('base');
  const asset = watch('asset');

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (base && asset) {
      checkAvailableQuantity();
    }
  }, [base, asset]);

  const loadFormData = async () => {
    try {
      const [assetsResponse, basesResponse] = await Promise.all([
        assetsAPI.getAll(),
        basesAPI.getAll()
      ]);
      
      // Handle the nested API response structure
      // API returns: { status: 'success', data: { assets: [...] } } or { status: 'success', data: [...] }
      console.log('Assets response:', assetsResponse.data); // Debug log
      console.log('Bases response:', basesResponse.data); // Debug log
      
      const assetsData = assetsResponse.data?.data?.assets || assetsResponse.data?.data || assetsResponse.data || [];
      const basesData = basesResponse.data?.data?.bases || basesResponse.data?.data || basesResponse.data || [];
      
      console.log('Processed assets:', assetsData); // Debug log
      console.log('Processed bases:', basesData); // Debug log
      
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setBases(Array.isArray(basesData) ? basesData : []);
      
    } catch (error) {
      console.error('Error loading form data:', error);
      // Set empty arrays as fallback
      setAssets([]);
      setBases([]);
    }
  };

  const checkAvailableQuantity = async () => {
    try {
      const response = await assetsAPI.getById(asset);
      console.log('Asset quantity response:', response.data); // Debug log
      
      // Handle the API response structure for single asset
      const assetData = response.data?.data?.asset || response.data?.data || response.data;
      console.log('Asset data:', assetData); // Debug log
      
      setAvailableQuantity(assetData?.currentQuantity || 0);
    } catch (error) {
      console.error('Error checking available quantity:', error);
      setAvailableQuantity(0);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await assignmentsAPI.create(data);
      navigate('/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      // You might want to add user-friendly error handling here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Create Asset Assignment">
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
                    {asset.name} ({asset.assetId})
                  </option>
                ))}
              </select>
              {errors.asset && (
                <p className="text-red-600 text-sm mt-1">{errors.asset.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To *
              </label>
              <input
                {...register('assignedTo', { required: 'Assigned to is required' })}
                className="input-field"
                placeholder="Enter personnel name or ID"
              />
              {errors.assignedTo && (
                <p className="text-red-600 text-sm mt-1">{errors.assignedTo.message}</p>
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
                Assignment Date *
              </label>
              <input
                type="date"
                {...register('assignmentDate', { required: 'Assignment date is required' })}
                className="input-field"
              />
              {errors.assignmentDate && (
                <p className="text-red-600 text-sm mt-1">{errors.assignmentDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Return Date
              </label>
              <input
                type="date"
                {...register('expectedReturnDate')}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose *
              </label>
              <select
                {...register('purpose', { required: 'Purpose is required' })}
                className="input-field"
              >
                <option value="">Select Purpose</option>
                <option value="training">Training</option>
                <option value="operation">Operation</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
              {errors.purpose && (
                <p className="text-red-600 text-sm mt-1">{errors.purpose.message}</p>
              )}
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
              placeholder="Additional notes about this assignment"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/assignments')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AssignmentForm;