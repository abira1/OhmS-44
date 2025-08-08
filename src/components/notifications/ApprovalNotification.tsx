// Notification component for approval status updates
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { UserApprovalStatus } from '../../types';

interface ApprovalNotificationProps {
  status: UserApprovalStatus;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const ApprovalNotification: React.FC<ApprovalNotificationProps> = ({
  status,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getNotificationConfig = () => {
    switch (status.status) {
      case 'approved':
        return {
          icon: CheckCircle,
          title: 'ACCESS APPROVED',
          message: 'Your access request has been approved! You can now access OhmS.',
          bgColor: 'bg-green-900/90',
          borderColor: 'border-green-500',
          iconColor: 'text-green-400',
          titleColor: 'text-green-300'
        };
      case 'denied':
        return {
          icon: XCircle,
          title: 'ACCESS DENIED',
          message: status.reason || 'Your access request has been denied. Contact the administrator for more information.',
          bgColor: 'bg-red-900/90',
          borderColor: 'border-red-500',
          iconColor: 'text-red-400',
          titleColor: 'text-red-300'
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          title: 'REQUEST PENDING',
          message: 'Your access request is being reviewed by administrators.',
          bgColor: 'bg-orange-900/90',
          borderColor: 'border-orange-500',
          iconColor: 'text-orange-400',
          titleColor: 'text-orange-300'
        };
    }
  };

  const config = getNotificationConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          ${config.bgColor} ${config.borderColor}
          border-2 rounded-lg p-4 retro-glow backdrop-blur-sm
          shadow-lg
        `}
      >
        <div className="flex items-start space-x-3">
          <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          
          <div className="flex-1 min-w-0">
            <h3 className={`${config.titleColor} font-mono text-sm font-bold mb-1`}>
              {config.title}
            </h3>
            <p className="text-retro-cyan font-mono text-xs leading-relaxed">
              {config.message}
            </p>
            
            {status.updatedBy && (
              <p className="text-retro-green/70 font-mono text-xs mt-2">
                Reviewed by: {status.updatedBy}
              </p>
            )}
          </div>

          <button
            onClick={handleClose}
            className="text-retro-green/70 hover:text-retro-green transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="mt-3 h-1 bg-retro-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.borderColor.replace('border-', 'bg-')} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ApprovalNotification;
