import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import Card from '../common/Card';
import { USER_ROLES } from '../../utils/constants';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      let usersData = response.data;
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      }
      else if (usersData && Array.isArray(usersData.users)) {
        setUsers(usersData.users);
      }
      else if (usersData && Array.isArray(usersData.data)) {
        setUsers(usersData.data);
      }
      else if (usersData && Array.isArray(usersData.items)) {
        setUsers(usersData.items);
      }
      else if (usersData && Array.isArray(usersData.results)) {
        setUsers(usersData.results);
      }
      else {
        console.log('Response.data structure:', Object.keys(usersData || {}));
        setUsers([]);
        setError('Unexpected data format from server');
      }
      
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const response = await usersAPI.toggleStatus(id);
      
      setUsers(users.map(user => 
        user._id === id 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
      
      setError('');
      console.log(`User ${action}d successfully`);
      
    } catch (error) {
      setError(`Failed to ${action} user`);
      console.error(`Error ${action}ing user:`, error);
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      [USER_ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
      [USER_ROLES.COMMANDER]: 'bg-red-100 text-red-800',
      [USER_ROLES.LOGISTICS]: 'bg-blue-100 text-blue-800',
      [USER_ROLES.UNIT_LEADER]: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <Link
          to="/users/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New User
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium text-gray-900">
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{user.base?.name || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link
                      to={`/users/edit/${user._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className={`${
                        user.isActive 
                          ? 'text-orange-600 hover:text-orange-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      disabled={user.role === USER_ROLES.ADMIN}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )) : null}
          </TableBody>
        </Table>

        {(!users || users.length === 0) && !loading && (
          <div className="text-center py-8 text-gray-500">
            No users found. Create your first user to get started.
          </div>
        )}
      </Card>
    </div>
  );
};

export default UsersList;