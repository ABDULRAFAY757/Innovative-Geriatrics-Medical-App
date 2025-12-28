import { Loader2 } from 'lucide-react';

/**
 * Loading Spinner Component
 * Provides visual feedback during async operations
 *
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} text - Optional loading text to display
 * @param {boolean} fullPage - Whether to display as full page overlay
 * @param {string} color - Color variant: 'blue', 'white', 'gray' (default: 'blue')
 */
const LoadingSpinner = ({
  size = 'md',
  text = '',
  fullPage = false,
  color = 'blue'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      />
      {text && (
        <p className={`text-${color === 'white' ? 'white' : 'gray-600'} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Skeleton Loader Component
 * Provides a placeholder while content is loading
 *
 * @param {string} variant - Type of skeleton: 'text', 'card', 'table', 'circle'
 * @param {number} count - Number of skeleton items to show (default: 1)
 */
export const SkeletonLoader = ({ variant = 'text', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  const variants = {
    text: (
      <div className="space-y-3 animate-pulse">
        {skeletons.map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    ),
    card: (
      <div className="animate-pulse">
        {skeletons.map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    ),
    table: (
      <div className="animate-pulse">
        <div className="bg-gray-100 h-12 rounded-t-xl mb-2"></div>
        {skeletons.map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    ),
    circle: (
      <div className="animate-pulse flex gap-4">
        {skeletons.map((_, i) => (
          <div key={i} className="w-12 h-12 bg-gray-200 rounded-full"></div>
        ))}
      </div>
    ),
  };

  return variants[variant] || variants.text;
};

/**
 * Empty State Component
 * Displays when there's no data to show
 *
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description
 * @param {React.ReactNode} icon - Icon component to display
 * @param {React.ReactNode} action - Optional action button
 */
export const EmptyState = ({ title, description, icon: Icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
