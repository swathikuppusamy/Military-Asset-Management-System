import React from 'react';
import { format } from 'date-fns';

const DateFilter = ({ filters, onChange }) => {
  const handleDateChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
        <input
          type="date"
          value={format(filters.startDate, 'yyyy-MM-dd')}
          onChange={(e) => handleDateChange('startDate', new Date(e.target.value))}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
        <input
          type="date"
          value={format(filters.endDate, 'yyyy-MM-dd')}
          onChange={(e) => handleDateChange('endDate', new Date(e.target.value))}
          className="input-field"
        />
      </div>
    </div>
  );
};

export default DateFilter;