import React from 'react';

// Main Table component
export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="table-container">
      <table className={`table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

// Table Header component
export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`table-header ${className}`} {...props}>
      {children}
    </thead>
  );
};

// Table Body component
export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

// Table Row component
export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr className={`table-tr ${className}`} {...props}>
      {children}
    </tr>
  );
};

// Table Head component (for header cells)
export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th className={`table-th ${className}`} {...props}>
      {children}
    </th>
  );
};

// Table Cell component
export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`table-td ${className}`} {...props}>
      {children}
    </td>
  );
};

const DefaultTable = ({ columns, data, emptyMessage = "No data available", loading = false }) => {
  const validData = Array.isArray(data) ? data : [];
  const validColumns = Array.isArray(columns) ? columns : [];

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {validColumns.map((column, index) => (
              <TableHead key={index}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={validColumns.length} className="text-center py-8">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {validColumns.map((column, index) => (
            <TableHead key={index}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {validData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={validColumns.length} className="px-6 py-8 text-center text-gray-500">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          validData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {validColumns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {column.cell ? column.cell(row) : row[column.accessor]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default DefaultTable;