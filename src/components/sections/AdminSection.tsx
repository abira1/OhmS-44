// Admin section component with simplified user management
import React from 'react';
import { Shield, Users } from 'lucide-react';
import UserApprovalDashboard from '../admin/UserApprovalDashboard';
import { useAuth } from '../../context/AuthContext';
import { isUserAdmin } from '../../types';

export const AdminSection: React.FC = () => {
  const { user } = useAuth();

  // Only show to admin users
  if (!user || !isUserAdmin(user)) {
    return (
      <div className="neu-card p-8 text-center">
        <Shield className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h2 className="text-red-600 dark:text-red-400 font-vhs text-xl font-bold mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Administrator privileges required
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neu-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-retro-purple/10 dark:bg-retro-teal/10 rounded-xl neu-shadow-sm flex items-center justify-center">
            <Users className="w-6 h-6 text-retro-purple dark:text-retro-teal" />
          </div>
          <div>
            <h1 className="text-2xl font-vhs font-bold text-gray-800 dark:text-gray-100">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Review and manage user access requests
            </p>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Logged in as: {user.email} • Administrator
        </div>
      </div>

      {/* User Approval Dashboard */}
      <UserApprovalDashboard />
    </div>
  );
};

export default AdminSection;
