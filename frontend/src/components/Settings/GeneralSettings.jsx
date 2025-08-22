import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { settingsAPI } from '../../services/api';

const GeneralSettings = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getGeneral();
      const settings = response.data;
      Object.keys(settings).forEach(key => {
        setValue(key, settings[key]);
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await settingsAPI.updateGeneral(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Name *
              </label>
              <input
                {...register('systemName', { required: 'System name is required' })}
                className="input-field"
                placeholder="Military Asset Management System"
              />
              {errors.systemName && (
                <p className="text-red-600 text-sm mt-1">{errors.systemName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                {...register('organizationName', { required: 'Organization name is required' })}
                className="input-field"
                placeholder="Department of Defense"
              />
              {errors.organizationName && (
                <p className="text-red-600 text-sm mt-1">{errors.organizationName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                {...register('contactEmail', { 
                  required: 'Contact email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="input-field"
                placeholder="contact@military.gov"
              />
              {errors.contactEmail && (
                <p className="text-red-600 text-sm mt-1">{errors.contactEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold *
              </label>
              <input
                type="number"
                {...register('lowStockThreshold', { 
                  required: 'Low stock threshold is required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                className="input-field"
                placeholder="10"
              />
              {errors.lowStockThreshold && (
                <p className="text-red-600 text-sm mt-1">{errors.lowStockThreshold.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Critical Stock Threshold *
              </label>
              <input
                type="number"
                {...register('criticalStockThreshold', { 
                  required: 'Critical stock threshold is required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                className="input-field"
                placeholder="5"
              />
              {errors.criticalStockThreshold && (
                <p className="text-red-600 text-sm mt-1">{errors.criticalStockThreshold.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-generate Asset IDs
              </label>
              <select
                {...register('autoGenerateAssetIds')}
                className="input-field"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset ID Prefix
              </label>
              <input
                {...register('assetIdPrefix')}
                className="input-field"
                placeholder="AST"
                maxLength={5}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('emailNotifications')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Enable Email Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('lowStockAlerts')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Low Stock Alerts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('transferApprovalAlerts')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Transfer Approval Alerts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('assignmentAlerts')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Assignment Alerts
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {saved && (
            <span className="text-green-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved successfully
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;