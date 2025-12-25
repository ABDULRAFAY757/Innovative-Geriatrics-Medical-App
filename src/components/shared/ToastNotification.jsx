import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Toast notification component for user feedback
 * Automatically dismisses after 5 seconds
 */
const ToastNotification = ({ notification, onClose }) => {
  const { type, title, message, id } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-sm w-full animate-slideIn',
        config.bgColor,
        config.textColor
      )}
    >
      <Icon className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Toast container that displays multiple toasts
 */
export const ToastContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default ToastNotification;
