// Admin dashboard for managing user approval requests
import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Mail, User, Calendar, AlertCircle } from 'lucide-react';
import { UserApprovalRequest } from '../../types';
import { UserApprovalService } from '../../services/userApprovalService';
import { useAuth } from '../../context/AuthContext';

export const UserApprovalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<UserApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Load pending requests
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const result = await UserApprovalService.getPendingApprovalRequests();
        if (result.success) {
          setPendingRequests(result.data || []);
        } else {
          setError(result.error || 'Failed to load requests');
        }
      } catch (err) {
        setError('Failed to load pending requests');
      } finally {
        setLoading(false);
      }
    };

    loadPendingRequests();

    // Listen for real-time updates
    const unsubscribe = UserApprovalService.onPendingRequestsChanged((requests) => {
      setPendingRequests(requests);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleApprove = async (request: UserApprovalRequest) => {
    if (!user?.email) return;

    setProcessingIds(prev => new Set(prev).add(request.uid));
    try {
      const result = await UserApprovalService.approveUser(request.uid, user.email);
      if (!result.success) {
        setError(result.error || 'Failed to approve user');
      }
    } catch (err) {
      setError('Failed to approve user');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.uid);
        return newSet;
      });
    }
  };

  const handleDeny = async (request: UserApprovalRequest, reason?: string) => {
    if (!user?.email) return;

    setProcessingIds(prev => new Set(prev).add(request.uid));
    try {
      const result = await UserApprovalService.denyUser(request.uid, user.email, reason);
      if (!result.success) {
        setError(result.error || 'Failed to deny user');
      }
    } catch (err) {
      setError('Failed to deny user');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.uid);
        return newSet;
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="neu-card p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-vhs">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status summary */}
      <div className="neu-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-vhs font-bold text-gray-800 dark:text-gray-100 mb-1">
              Pending Requests
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {pendingRequests.length} user{pendingRequests.length !== 1 ? 's' : ''} waiting for approval
            </p>
          </div>

          {pendingRequests.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-600 dark:text-orange-400 font-vhs text-sm">
                {pendingRequests.length} pending
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="neu-card p-4 border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Pending requests */}
      {pendingRequests.length === 0 ? (
        <div className="neu-card p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-gray-800 dark:text-gray-200 font-vhs text-lg font-bold mb-2">
            No Pending Requests
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All access requests have been processed
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const isProcessing = processingIds.has(request.uid);

            return (
              <div key={request.uid} className="neu-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* User info */}
                    <div className="flex items-center space-x-4 mb-4">
                      {request.photoURL ? (
                        <img
                          src={request.photoURL}
                          alt={request.displayName || 'User'}
                          className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center neu-shadow-sm">
                          <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-gray-800 dark:text-gray-100 font-vhs text-lg font-bold">
                          {request.displayName || 'Unknown User'}
                        </h3>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                          <Mail className="w-4 h-4" />
                          <span>{request.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Request details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Requested: {formatDate(request.requestedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Status: {request.status}</span>
                      </div>
                    </div>

                    {/* Request ID */}
                    <div className="text-gray-400 dark:text-gray-500 text-xs mb-4">
                      Request ID: {request.uid.slice(-8).toUpperCase()}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col space-y-3 ml-4">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={isProcessing}
                      className="neu-button px-4 py-2 rounded-lg flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span className="font-vhs text-sm">Approve</span>
                    </button>

                    <button
                      onClick={() => handleDeny(request)}
                      disabled={isProcessing}
                      className="neu-button px-4 py-2 rounded-lg flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span className="font-vhs text-sm">Deny</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserApprovalDashboard;
