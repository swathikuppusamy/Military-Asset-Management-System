import React, { useState, useEffect } from 'react';
import MetricsCard from './MetricsCard';
import Charts from './Charts';
import { dashboardAPI } from '../../services/api';
import DateFilter from '../common/DateFilter';
import BaseFilter from '../common/BaseFilter';
import AssetTypeFilter from '../common/AssetTypeFilter';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    base: '',
    assetType: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Loading dashboard data with filters:', filters);
    
    const [metricsResponse, chartsResponse] = await Promise.allSettled([
      dashboardAPI.getMetrics(filters),
      dashboardAPI.getChartsData(filters)
    ]);
    
    console.log('Metrics response:', metricsResponse);
    console.log('Charts response:', chartsResponse);
    
    // Handle metrics response
    if (metricsResponse.status === 'fulfilled') {
      const metricsData = metricsResponse.value?.data?.data || metricsResponse.value?.data || null;
      setMetrics(metricsData);
    } else {
      console.warn('Metrics API failed:', metricsResponse.reason);
      setError(prev => prev + ' Failed to load metrics. ');
    }
    
    // Handle charts response
    if (chartsResponse.status === 'fulfilled') {
      const chartsDataResult = chartsResponse.value?.data?.data || chartsResponse.value?.data || null;
      setChartsData(chartsDataResult);
    } else {
      console.error('Charts API failed:', chartsResponse.reason);
      setError(prev => prev + ' Failed to load charts. ');
    }
    
  } catch (error) {
    console.error('Unexpected error loading dashboard data:', error);
    setError(`Unexpected error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleFilterChange = (newFilters) => {
    console.log('Filter changed:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !metrics && !chartsData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-4 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <DateFilter filters={filters} onChange={handleFilterChange} />
          <BaseFilter filters={filters} onChange={handleFilterChange} />
          <AssetTypeFilter filters={filters} onChange={handleFilterChange} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Opening Balance"
          value={metrics?.openingBalance || 0}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          loading={loading}
        />
        <MetricsCard
          title="Closing Balance"
          value={metrics?.closingBalance || 0}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          loading={loading}
        />
        <MetricsCard
          title="Net Movement"
          value={metrics?.netMovement || 0}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          }
          loading={loading}
          detailView={metrics?.movementDetails}
        />
        <MetricsCard
          title="Assigned Assets"
          value={metrics?.assigned || 0}
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          loading={loading}
        />
      </div>

      {/* Charts Section - Always render, let Charts component handle empty data */}
      <Charts data={chartsData} loading={loading} />
      
     
      
    </div>
  );
};

export default Dashboard;