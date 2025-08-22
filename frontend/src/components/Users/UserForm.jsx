import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersAPI, settingsAPI } from '../../services/api';
import Card from '../common/Card';
import { USER_ROLES } from '../../utils/constants';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: USER_ROLES.UNIT_LEADER,
    base: '',
    isActive: true,
    password: '',
    confirmPassword: ''
  });

  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBases();
    if (isEdit) {
      fetchUser();
    }
  }, [id]);

  const fetchBases = async () => {
    try {
      const response = await settingsAPI.getBases();
      console.log('Bases API response:', response);
      
      const basesData = response.data?.data || [];
      
      if (Array.isArray(basesData)) {
        setBases(basesData);
      } else {
        console.error('Bases data is not an array:', basesData);
        setBases([]);
        setError('Failed to load bases - invalid data format');
      }
    } catch (error) {
      console.error('Error fetching bases:', error);
      setBases([]); 
      setError('Failed to load bases');
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getById(id);
      const user = response.data?.data || response.data; 
      
      setFormData({
        name: user.username || user.name, 
        email: user.email,
        role: user.role,
        base: user.base?._id || '',
        isActive: user.isActive,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError('Failed to fetch user data');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!isEdit && !formData.password) {
      setError('Password is required for new users');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name, 
        email: formData.email,
        role: formData.role,
        base: formData.base || undefined, 
        isActive: formData.isActive,
        ...(formData.password && { password: formData.password })
      };

      console.log('Sending user data:', userData); 

      if (isEdit) {
        await usersAPI.update(id, userData);
        setSuccess('User updated successfully');
      } else {
        await usersAPI.create(userData);
        setSuccess('User created successfully');
      }

      setTimeout(() => {
        navigate('/users');
      }, 1000);
    } catch (error) {
      console.error('Submit error:', error); 
      const errorMessage = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading user data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit User' : 'Create New User'}
        </h1>
        <button
          onClick={() => navigate('/users')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Users
        </button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={USER_ROLES.UNIT_LEADER}>Unit Leader</option>
                <option value={USER_ROLES.LOGISTICS}>Logistics</option>
                <option value={USER_ROLES.COMMANDER}>Commander</option>
                <option value={USER_ROLES.ADMIN}>Administrator</option>
              </select>
            </div>

            <div>
              <label htmlFor="base" className="block text-sm font-medium text-gray-700">
                Base Assignment
              </label>
              <select
                id="base"
                name="base"
                value={formData.base}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Base</option>
                {Array.isArray(bases) && bases.length > 0 ? (
                  bases.map((base) => (
                    <option key={base._id} value={base._id}>
                      {base.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No bases available</option>
                )}
              </select>
              {Array.isArray(bases) && bases.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  No bases found. Please contact an administrator.
                </p>
              )}
            </div>

            {!isEdit && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required={!isEdit}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required={!isEdit}
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active User Account
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Inactive users cannot log into the system.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserForm;