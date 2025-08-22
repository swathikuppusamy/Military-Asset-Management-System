import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assignmentsAPI } from '../../services/api';
import Card from '../common/Card';
import { format } from 'date-fns';

const AssignmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (id) {
      loadAssignment();
    }
  }, [id]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await assignmentsAPI.getById(id);
      console.log('Assignment response:', response.data);
      
      const assignmentData = response.data.data;
      console.log('Processed assignment:', assignmentData);
      
      setAssignment(assignmentData);
    } catch (error) {
      console.error('Error loading assignment:', error);
      alert('Assignment not found or error loading assignment');
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  };

const handleReturn = async () => {
  try {
    setActionLoading(prev => ({ ...prev, return: true }));
    
    const response = await assignmentsAPI.return(id);
    console.log('Return response:', response);
    
    await loadAssignment(); 
    
    alert('Assignment returned successfully!');
    
  } catch (error) {
    console.error('Error returning assignment:', error);
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Error returning assignment. Please try again.';
    
    alert(errorMessage);
  } finally {
    setActionLoading(prev => ({ ...prev, return: false }));
  }
};

const handleExpend = async () => {
  try {
    setActionLoading(prev => ({ ...prev, expend: true }));
    
    const response = await assignmentsAPI.expend(id);
    console.log('Expend response:', response);
    
    await loadAssignment(); 
    
    alert('Assignment marked as expended successfully!');
    
  } catch (error) {
    console.error('Error marking as expended:', error);
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Error marking assignment as expended. Please try again.';
    
    alert(errorMessage);
  } finally {
    setActionLoading(prev => ({ ...prev, expend: false }));
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-blue-100 text-blue-800';
      case 'expended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading assignment details...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Assignment not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assignment Details</h1>
        <div className="flex space-x-3">
          {assignment.status === 'active' && (
            <>
              <button
                onClick={handleReturn}
                disabled={actionLoading.return}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading.return ? 'Returning...' : 'Mark as Returned'}
              </button>
              <button
                onClick={handleExpend}
                disabled={actionLoading.expend}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading.expend ? 'Processing...' : 'Mark as Expended'}
              </button>
            </>
          )}
          <Link to="/assignments" className="btn-secondary">
            Back to Assignments
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card title="Assignment Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Assignment ID</label>
              <p className="text-base font-semibold">{assignment.assignmentId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                {assignment.status?.charAt(0).toUpperCase() + assignment.status?.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Assignment Date</label>
              <p className="text-base">{format(new Date(assignment.assignmentDate), 'MMMM dd, yyyy')}</p>
            </div>
            {assignment.expectedReturnDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Expected Return Date</label>
                <p className="text-base">{format(new Date(assignment.expectedReturnDate), 'MMMM dd, yyyy')}</p>
              </div>
            )}
            {assignment.actualReturnDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Actual Return Date</label>
                <p className="text-base">{format(new Date(assignment.actualReturnDate), 'MMMM dd, yyyy')}</p>
              </div>
            )}
            {assignment.purpose && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Purpose</label>
                <p className="text-base capitalize">{assignment.purpose}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Asset Information */}
        <Card title="Asset Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Asset Name</label>
              <p className="text-base font-semibold">{assignment.asset?.name || assignment.asset?.assetId || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Asset ID</label>
              <p className="text-base">{assignment.asset?.assetId || assignment.asset?.id || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Quantity Assigned</label>
              <p className="text-base font-semibold">{assignment.quantity}</p>
            </div>
          </div>
        </Card>

        {/* Assignment Details */}
        <Card title="Assignment Details">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Assigned To</label>
              <p className="text-base font-semibold">{assignment.assignedTo}</p>
            </div>
            {assignment.rank && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Rank</label>
                <p className="text-base">{assignment.rank}</p>
              </div>
            )}
            {assignment.unit && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Unit</label>
                <p className="text-base">{assignment.unit}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500">Base</label>
              <p className="text-base">{assignment.base?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Assigned By</label>
              <p className="text-base">{assignment.assignedBy?.name || assignment.assignedBy?.username || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        {assignment.notes && (
          <Card title="Notes">
            <div className="space-y-4">
              <div>
                <p className="text-base whitespace-pre-wrap">{assignment.notes}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Timeline */}
      <Card title="Timeline">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Created</span>
            <span className="text-sm">
              {assignment.createdAt ? format(new Date(assignment.createdAt), 'MMMM dd, yyyy HH:mm') : 'N/A'}
            </span>
          </div>
          {assignment.updatedAt && assignment.updatedAt !== assignment.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Last Updated</span>
              <span className="text-sm">
                {format(new Date(assignment.updatedAt), 'MMMM dd, yyyy HH:mm')}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AssignmentView;  