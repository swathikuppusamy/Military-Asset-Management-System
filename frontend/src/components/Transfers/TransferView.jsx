import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { transfersAPI } from '../../services/api';
import Card from '../common/Card';
import { format } from 'date-fns';

const TransferView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTransfer();
  }, [id]);

  const loadTransfer = async () => {
    try {
      setLoading(true);
      const response = await transfersAPI.getById(id);
      
      let transferData = null;
      if (response.data && response.data.data && response.data.data.transfer) {
        transferData = response.data.data.transfer;
      } else if (response.data && response.data.data) {
        transferData = response.data.data;
      } else if (response.data) {
        transferData = response.data;
      }
      
      setTransfer(transferData);
    } catch (error) {
      console.error('Error loading transfer:', error);
      if (error.response?.status === 404) {
        navigate('/transfers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await transfersAPI.approve(id);
      await loadTransfer(); 
    } catch (error) {
      console.error('Error approving transfer:', error);
      alert('Error approving transfer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this transfer?')) {
      try {
        setActionLoading(true);
        await transfersAPI.reject(id);
        await loadTransfer(); 
      } catch (error) {
        console.error('Error rejecting transfer:', error);
        alert('Error rejecting transfer. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this transfer?')) {
      try {
        setActionLoading(true);
        await transfersAPI.cancel(id);
        await loadTransfer(); 
      } catch (error) {
        console.error('Error cancelling transfer:', error);
        alert('Error cancelling transfer. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const statusText = {
      pending: 'Pending',
      approved: 'Approved',
      completed: 'Completed',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || badges.cancelled}`}>
        {statusText[status] || 'Unknown'}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    const priorityText = {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[priority] || badges.medium}`}>
        {priorityText[priority] || 'Medium'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card title="Transfer Not Found">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">The requested transfer could not be found.</p>
            <Link to="/transfers" className="btn-primary">
              Back to Transfers
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfer Details</h1>
          <p className="text-gray-600">Transfer ID: {transfer.transferId}</p>
        </div>
        <div className="flex items-center space-x-3">
          {transfer.status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="btn bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Cancel'}
              </button>
            </>
          )}
          <Link to="/transfers" className="btn-secondary">
            Back to Transfers
          </Link>
        </div>
      </div>

      {/* Transfer Information */}
      <Card title="Transfer Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div>{getStatusBadge(transfer.status)}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div>{getPriorityBadge(transfer.priority)}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <div className="text-gray-900 font-medium">{transfer.quantity}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
            <div className="text-gray-900">{format(new Date(transfer.createdAt), 'MMM dd, yyyy HH:mm')}</div>
          </div>
          
          {transfer.transferDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date</label>
              <div className="text-gray-900">{format(new Date(transfer.transferDate), 'MMM dd, yyyy HH:mm')}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Asset Information */}
      <Card title="Asset Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID</label>
            <div className="text-gray-900">{transfer.asset?.assetId || 'N/A'}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
            <div className="text-gray-900">{transfer.asset?.type?.name || 'N/A'}</div>
          </div>
        </div>
      </Card>

      {/* Transfer Details */}
      <Card title="Transfer Route">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Base</label>
            <div className="text-gray-900 font-medium">{transfer.fromBase?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{transfer.fromBase?.location || ''}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Base</label>
            <div className="text-gray-900 font-medium">{transfer.toBase?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{transfer.toBase?.location || ''}</div>
          </div>
        </div>
      </Card>

      {/* Personnel Information */}
      <Card title="Personnel Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initiated By</label>
            <div className="text-gray-900">{transfer.initiatedBy?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{transfer.initiatedBy?.email || ''}</div>
          </div>
          
          {transfer.approvedBy && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
              <div className="text-gray-900">{transfer.approvedBy?.name || 'N/A'}</div>
              <div className="text-sm text-gray-500">{transfer.approvedBy?.email || ''}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Notes */}
      {transfer.notes && (
        <Card title="Notes">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{transfer.notes}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TransferView;