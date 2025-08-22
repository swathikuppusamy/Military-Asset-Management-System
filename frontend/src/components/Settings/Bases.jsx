import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { basesAPI } from '../../services/api';
import Table from '../common/Table';
import Card from '../common/Card';

const Bases = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBase, setEditingBase] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBases();
  }, []);

  const loadBases = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await basesAPI.getAll();
      
      console.log('Bases API Response:', response);
      console.log('Response data:', response.data);
      
      let basesData = response.data;
      
      if (Array.isArray(basesData)) {
        setBases(basesData);
      } else if (basesData && Array.isArray(basesData.data)) {
        setBases(basesData.data);
      } else if (basesData && Array.isArray(basesData.bases)) {
        setBases(basesData.bases);
      } else if (basesData && Array.isArray(basesData.results)) {
        setBases(basesData.results);
      } else {
        console.log('Response data structure:', Object.keys(basesData || {}));
        setBases([]);
        setError('Unexpected data format from server');
      }
      
    } catch (error) {
      console.error('Error loading bases:', error);
      setError('Failed to load bases');
      setBases([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      if (editingBase) {
        await basesAPI.update(editingBase._id, data);
        setEditingBase(null);
      } else {
        await basesAPI.create(data);
      }
      reset();
      loadBases();
    } catch (error) {
      console.error('Error saving base:', error);
      setError('Failed to save base');
    }
  };

  const handleEdit = (base) => {
    setEditingBase(base);
    reset({
      name: base.name,
      code: base.code,
      location: base.location,
      type: base.type,
      isActive: base.isActive
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this base?`)) {
      return;
    }

    try {
      setError('');
      await basesAPI.update(id, { isActive: !currentStatus });
      
      setBases(bases.map(base => 
        base._id === id 
          ? { ...base, isActive: !currentStatus }
          : base
      ));
      
      console.log(`Base ${action}d successfully`);
      
    } catch (error) {
      console.error(`Error ${action}ing base:`, error);
      setError(`Failed to ${action} base`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this base?')) {
      try {
        setError('');
        await basesAPI.delete(id);
        loadBases();
      } catch (error) {
        console.error('Error deleting base:', error);
        setError('Failed to delete base');
      }
    }
  };

  const cancelEdit = () => {
    setEditingBase(null);
    reset();
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name'
    },
    {
      header: 'Code',
      accessor: 'code'
    },
    {
      header: 'Location',
      accessor: 'location'
    },
    {
      header: 'Actions',
      cell: (base) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleDelete(base._id)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingBase ? 'Edit Base' : 'Add New Base'}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="input-field"
                placeholder="e.g., Fort Bragg, Naval Base San Diego"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code *
              </label>
              <input
                {...register('code', { required: 'Code is required' })}
                className="input-field"
                placeholder="e.g., FB, NBSD"
                maxLength={10}
              />
              {errors.code && (
                <p className="text-red-600 text-sm mt-1">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                {...register('location', { required: 'Location is required' })}
                className="input-field"
                placeholder="e.g., North Carolina, USA"
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                {...register('type')}
                className="input-field"
              >
                <option value="">Select Type</option>
                <option value="army">Army Base</option>
                <option value="navy">Naval Base</option>
                <option value="airforce">Air Force Base</option>
                <option value="marine">Marine Corps Base</option>
                <option value="coastguard">Coast Guard Base</option>
                <option value="joint">Joint Base</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active Base
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            {editingBase && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
            >
              {editingBase ? 'Update' : 'Add'} Base
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bases List</h3>
        <Table
          columns={columns}
          data={bases}
          loading={loading}
          emptyMessage="No bases found. Add your first base to get started."
        />
      </div>
    </div>
  );
};

export default Bases;