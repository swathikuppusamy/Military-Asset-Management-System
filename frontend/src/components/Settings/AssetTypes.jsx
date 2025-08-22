import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { assetTypesAPI } from '../../services/api';
import Table from '../common/Table';
import Card from '../common/Card';

const AssetTypes = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState(null);

  useEffect(() => {
    loadAssetTypes();
  }, []);

  const loadAssetTypes = async () => {
    try {
      setLoading(true);
      const response = await assetTypesAPI.getAll();
      setAssetTypes(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading asset types:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingType) {
        await assetTypesAPI.update(editingType._id, data);
        setEditingType(null);
      } else {
        await assetTypesAPI.create(data);
      }
      reset();
      loadAssetTypes();
    } catch (error) {
      console.error('Error saving asset type:', error);
      alert('Error saving asset type. Please try again.');
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    reset({
      name: type.name,
      description: type.description,
      category: type.category,
      unit: type.unit,
      isConsumable: type.isConsumable,
      requiresSerial: type.requiresSerial,
      requiresMaintenance: type.requiresMaintenance
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset type?')) {
      try {
        await assetTypesAPI.delete(id);
        loadAssetTypes();
      } catch (error) {
        console.error('Error deleting asset type:', error);
        alert('Error deleting asset type. Please try again.');
      }
    }
  };

  const cancelEdit = () => {
    setEditingType(null);
    reset();
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name'
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (type) => (
        <span className="capitalize">{type.category}</span>
      )
    },
    {
      header: 'Description',
      accessor: 'description'
    },
    {
      header: 'Unit',
      accessor: 'unit',
      cell: (type) => (
        <span className="text-sm text-gray-600">{type.unit || 'piece'}</span>
      )
    },
    {
      header: 'Consumable',
      accessor: 'isConsumable',
      cell: (type) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          type.isConsumable
            ? 'bg-orange-100 text-orange-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {type.isConsumable ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'Requires Serial',
      accessor: 'requiresSerial',
      cell: (type) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          type.requiresSerial
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {type.requiresSerial ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'Requires Maintenance',
      accessor: 'requiresMaintenance',
      cell: (type) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          type.requiresMaintenance
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {type.requiresMaintenance ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (type) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(type)}
            className="text-primary-600 hover:text-primary-900"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(type._id)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingType ? 'Edit Asset Type' : 'Add New Asset Type'}
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
                placeholder="e.g., Rifle, Vehicle, Communication Device"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="input-field"
              >
                <option value="">Select Category</option>
                <option value="weapon">Weapon</option>
                <option value="vehicle">Vehicle</option>
                <option value="equipment">Equipment</option>
                <option value="communication">Communication</option>
                <option value="protective">Protective Gear</option>
                <option value="ammunition">Ammunition</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                {...register('unit')}
                className="input-field"
              >
                <option value="piece">Piece</option>
                <option value="rounds">Rounds</option>
                <option value="box">Box</option>
                <option value="set">Set</option>
                <option value="pair">Pair</option>
                <option value="kit">Kit</option>
                <option value="liter">Liter</option>
                <option value="kg">Kilogram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={2}
                className="input-field"
                placeholder="Brief description of this asset type"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isConsumable')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Is Consumable (gets used up)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('requiresSerial')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Requires Serial Numbers
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('requiresMaintenance')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Requires Maintenance Tracking
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            {editingType && (
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
              {editingType ? 'Update' : 'Add'} Asset Type
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Types List</h3>
        <Table
          columns={columns}
          data={assetTypes}
          loading={loading}
          emptyMessage="No asset types found"
        />
      </div>
    </div>
  );
};

export default AssetTypes;