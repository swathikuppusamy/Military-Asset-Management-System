import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Charts = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-yellow-800">No Data Available</h3>
            <p className="text-yellow-600 mt-1">No chart data is available for the selected filters.</p>
          </div>
        </div>
      </div>
    );
  }

  const { assetDistribution = [], monthlyMovement = [], statusDistribution = [] } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Distribution Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Distribution</h3>
        {assetDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500 py-12">No asset distribution data available</div>
        )}
      </div>

      {/* Monthly Movement Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Movement</h3>
        {monthlyMovement.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyMovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="purchases" fill="#0088FE" name="Purchases" />
              <Bar dataKey="transfersIn" fill="#00C49F" name="Transfers In" />
              <Bar dataKey="transfersOut" fill="#FF8042" name="Transfers Out" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500 py-12">No monthly movement data available</div>
        )}
      </div>

      {/* Status Distribution Chart (optional third chart) */}
      {statusDistribution.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Number of Assets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Charts;