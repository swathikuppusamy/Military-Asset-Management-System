import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { expendituresAPI } from '../../services/api';
import Card from '../common/Card';
import { format } from 'date-fns';

const ExpenditureView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expenditure, setExpenditure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (id) {
      loadExpenditure();
    }
  }, [id]);

  const loadExpenditure = async () => {
    try {
      setLoading(true);
      const response = await expendituresAPI.getById(id);
      console.log('Expenditure response:', response.data);
      
      const expenditureData = response.data.data;
      console.log('Processed expenditure:', expenditureData);
      
      setExpenditure(expenditureData);
    } catch (error) {
      console.error('Error loading expenditure:', error);
      alert('Expenditure not found or error loading expenditure');
      navigate('/expenditures');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(prev => ({ ...prev, approve: true }));
      
      const response = await expendituresAPI.approve(id);
      console.log('Approve response:', response);
      
      await loadExpenditure(); 
      
      alert('Expenditure approved successfully!');
      
    } catch (error) {
      console.error('Error approving expenditure:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error approving expenditure. Please try again.';
      
      alert(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, approve: false }));
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(prev => ({ ...prev, reject: true }));
      
      const response = await expendituresAPI.reject(id);
      console.log('Reject response:', response);
      
      await loadExpenditure(); 
      
      alert('Expenditure rejected successfully!');
      
    } catch (error) {
      console.error('Error rejecting expenditure:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error rejecting expenditure. Please try again.';
      
      alert(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, reject: false }));
    }
  };

  const getStatusColor = (approved) => {
    if (approved === true) {
      return 'bg-green-100 text-green-800';
    } else if (approved === false) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (approved) => {
    if (approved === true) {
      return 'Approved';
    } else if (approved === false) {
      return 'Rejected';
    } else {
      return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading expenditure details...</div>
      </div>
    );
  }

  if (!expenditure) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Expenditure not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expenditure Details</h1>
        <div className="flex space-x-3">
          {expenditure.approved === null && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading.approve}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading.approve ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading.reject}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading.reject ? 'Rejecting...' : 'Reject'}
              </button>
            </>
          )}
          <Link to="/expenditures" className="btn-secondary">
            Back to Expenditures
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card title="Expenditure Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Expenditure ID</label>
              <p className="text-base font-semibold">{expenditure._id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(expenditure.approved)}`}>
                {getStatusText(expenditure.approved)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Expenditure Date</label>
              <p className="text-base">{format(new Date(expenditure.expendedDate), 'MMMM dd, yyyy')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Reason</label>
              <p className="text-base capitalize">{expenditure.reason}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Quantity</label>
              <p className="text-base font-semibold">{expenditure.quantity}</p>
            </div>
            {expenditure.approvedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Approved Date</label>
                <p className="text-base">{format(new Date(expenditure.approvedDate), 'MMMM dd, yyyy')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Asset Information */}
        <Card title="Asset Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Asset Name</label>
              <p className="text-base font-semibold">{expenditure.asset?.type?.name || expenditure.asset?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Asset ID</label>
              <p className="text-base">{expenditure.asset?.assetId || expenditure.asset?.id || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Category</label>
              <p className="text-base capitalize">{expenditure.asset?.type?.category || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Unit</label>
              <p className="text-base">{expenditure.asset?.type?.unit || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Base and Personnel Information */}
        <Card title="Location & Personnel">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Base</label>
              <p className="text-base font-semibold">{expenditure.base?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Base Location</label>
              <p className="text-base">{expenditure.base?.location || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Expended By</label>
              <p className="text-base">{expenditure.expendedBy?.name || expenditure.expendedBy?.username || 'N/A'}</p>
            </div>
            {expenditure.approvedBy && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Approved By</label>
                <p className="text-base">{expenditure.approvedBy?.name || expenditure.approvedBy?.username || 'N/A'}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Additional Information */}
        <Card title="Additional Details">
          <div className="space-y-4">
            {expenditure.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="text-base whitespace-pre-wrap">{expenditure.description}</p>
              </div>
            )}
            {expenditure.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Notes</label>
                <p className="text-base whitespace-pre-wrap">{expenditure.notes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card title="Timeline">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Created</span>
            <span className="text-sm">
              {expenditure.createdAt ? format(new Date(expenditure.createdAt), 'MMMM dd, yyyy HH:mm') : 'N/A'}
            </span>
          </div>
          {expenditure.updatedAt && expenditure.updatedAt !== expenditure.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Last Updated</span>
              <span className="text-sm">
                {format(new Date(expenditure.updatedAt), 'MMMM dd, yyyy HH:mm')}
              </span>
            </div>
          )}
          {expenditure.expendedDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Expended</span>
              <span className="text-sm">
                {format(new Date(expenditure.expendedDate), 'MMMM dd, yyyy')}
              </span>
            </div>
          )}
          {expenditure.approvedDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Approved</span>
              <span className="text-sm">
                {format(new Date(expenditure.approvedDate), 'MMMM dd, yyyy HH:mm')}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExpenditureView;