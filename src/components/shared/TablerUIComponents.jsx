import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

// ========================================
// BUTTON
// ========================================
export const TablerButton = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  loading,
  pill,
  ...props
}) => {
  const variantMap = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
    'outline-primary': 'btn-outline-primary',
    'outline-secondary': 'btn-outline-secondary',
    'outline-success': 'btn-outline-success',
    'outline-danger': 'btn-outline-danger',
    'ghost-primary': 'btn-ghost-primary',
    'ghost-secondary': 'btn-ghost-secondary',
  };

  return (
    <button
      className={clsx('btn', variantMap[variant], `btn-${size}`, pill && 'btn-pill', loading && 'btn-loading', className)}
      {...props}
    >
      {Icon && !loading && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

// ========================================
// CARD
// ========================================
export const TablerCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  className,
  bodyClassName,
  status,
  statusPosition = 'top',
  stacked,
  size = 'md'
}) => {
  return (
    <div className={clsx('card', stacked && 'card-stacked', className)}>
      {status && <div className={`card-status-${statusPosition}`} style={{ backgroundColor: status }} />}

      {(title || action) && (
        <div className="card-header">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <div className="card-subtitle">{subtitle}</div>}
            </div>
            {action && <div className="ml-auto">{action}</div>}
          </div>
        </div>
      )}

      <div className={clsx('card-body', size !== 'md' && `card-${size}`, bodyClassName)}>
        {children}
      </div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// ========================================
// BADGE
// ========================================
export const TablerBadge = ({
  children,
  variant = 'primary',
  light,
  size = 'md',
  pill,
  className
}) => {
  const variantClass = light ? `badge-${variant}-lt` : `badge-${variant}`;

  return (
    <span className={clsx('badge', variantClass, size !== 'md' && `badge-${size}`, pill && 'badge-pill', className)}>
      {children}
    </span>
  );
};

// ========================================
// TABLE
// ========================================
export const TablerTable = ({
  columns,
  data,
  vcenter,
  nowrap,
  striped,
  responsive = true,
  stickyHeader,
  emptyMessage = 'No data available',
  className
}) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-gray-500"><p>{emptyMessage}</p></div>;
  }

  const table = (
    <table className={clsx('table', vcenter && 'table-vcenter', nowrap && 'table-nowrap', striped && 'table-striped', className)}>
      <thead className={stickyHeader ? 'sticky-top' : ''}>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className={col.className}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {columns.map((col, colIdx) => (
              <td key={colIdx} className={col.cellClassName}>
                {col.render ? col.render(row) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return responsive ? <div className="table-responsive">{table}</div> : table;
};

// ========================================
// FORM INPUT
// ========================================
export const TablerInput = ({
  label,
  icon: Icon,
  error,
  valid,
  size = 'md',
  className,
  ...props
}) => {
  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <input
          className={clsx('form-control', size !== 'md' && `form-control-${size}`, Icon && 'pl-10', error && 'is-invalid', valid && 'is-valid')}
          {...props}
        />
      </div>
      {error && <div className="invalid-feedback">{error}</div>}
      {valid && <div className="valid-feedback">{valid}</div>}
    </div>
  );
};

// ========================================
// SELECT
// ========================================
export const TablerSelect = ({
  label,
  options = [],
  placeholder,
  error,
  valid,
  size = 'md',
  className,
  ...props
}) => {
  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      <select className={clsx('form-select', size !== 'md' && `form-control-${size}`, error && 'is-invalid', valid && 'is-valid')} {...props}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
      {valid && <div className="valid-feedback">{valid}</div>}
    </div>
  );
};

// ========================================
// CHECKBOX
// ========================================
export const TablerCheckbox = ({ label, className, ...props }) => {
  return (
    <div className={clsx('form-check', className)}>
      <input type="checkbox" className="form-check-input" {...props} />
      {label && <label className="form-check-label">{label}</label>}
    </div>
  );
};

// ========================================
// RADIO
// ========================================
export const TablerRadio = ({ label, className, ...props }) => {
  return (
    <div className={clsx('form-check', className)}>
      <input type="radio" className="form-check-input" {...props} />
      {label && <label className="form-check-label">{label}</label>}
    </div>
  );
};

// ========================================
// ALERT
// ========================================
export const TablerAlert = ({
  type = 'info',
  title,
  children,
  icon: Icon,
  important,
  dismissible,
  onDismiss,
  className
}) => {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  return (
    <div className={clsx('alert', `alert-${type}`, important && 'alert-important', dismissible && 'alert-dismissible', className)}>
      {Icon && <Icon className="alert-icon w-5 h-5" />}
      <div className="flex-1">
        {title && <div className="alert-title">{title}</div>}
        <div>{children}</div>
      </div>
      {dismissible && (
        <button onClick={handleDismiss} className="btn-close" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ========================================
// MODAL
// ========================================
export const TablerModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  status,
  className
}) => {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal show">
        <div className={clsx('modal-dialog', size !== 'md' && `modal-${size}`, className)}>
          <div className="modal-content">
            {status && <div className="modal-status" style={{ backgroundColor: status }} />}

            {title && (
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button onClick={onClose} className="btn-close"><X className="w-4 h-4" /></button>
              </div>
            )}

            <div className="modal-body">{children}</div>

            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </>
  );
};

// ========================================
// AVATAR
// ========================================
export const TablerAvatar = ({
  name,
  size = 'md',
  src,
  status,
  rounded = true,
  className
}) => {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const style = src ? { backgroundImage: `url(${src})` } : {};

  return (
    <span
      className={clsx('avatar', size !== 'md' && `avatar-${size}`, rounded === 'circle' && 'rounded-full', rounded === false && 'rounded-0', className)}
      style={style}
      title={name}
    >
      {!src && initials}
      {status && <span className={`badge bg-${status}`} />}
    </span>
  );
};

// ========================================
// AVATAR LIST
// ========================================
export const TablerAvatarList = ({ avatars, stacked, max = 5, className }) => {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={clsx(stacked ? 'avatar-list-stacked' : 'avatar-list', className)}>
      {displayAvatars.map((avatar, idx) => <TablerAvatar key={idx} {...avatar} />)}
      {remainingCount > 0 && <span className="avatar">+{remainingCount}</span>}
    </div>
  );
};

// ========================================
// PAGINATION
// ========================================
export const TablerPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  outline,
  circle,
  className
}) => {
  const pages = useMemo(() => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) items.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) items.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) items.push(i);
    }

    return items;
  }, [currentPage, totalPages]);

  return (
    <ul className={clsx('pagination', outline && 'pagination-outline', circle && 'pagination-circle', className)}>
      <li className={clsx('page-item', currentPage === 1 && 'disabled')}>
        <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
      </li>

      {pages.map((page) => (
        <li key={page} className={clsx('page-item', currentPage === page && 'active')}>
          <button className="page-link" onClick={() => onPageChange(page)}>{page}</button>
        </li>
      ))}

      <li className={clsx('page-item', currentPage === totalPages && 'disabled')}>
        <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
      </li>
    </ul>
  );
};

// ========================================
// DROPDOWN
// ========================================
export const TablerDropdown = ({ trigger, children, arrow, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={clsx('dropdown', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">{trigger}</div>
      <div className={clsx('dropdown-menu', arrow && 'dropdown-menu-arrow', isOpen && 'show')}>{children}</div>
    </div>
  );
};

export const TablerDropdownItem = ({ onClick, disabled, active, children, className }) => (
  <button onClick={onClick} disabled={disabled} className={clsx('dropdown-item', active && 'active', disabled && 'disabled', className)}>
    {children}
  </button>
);

export const TablerDropdownDivider = () => <div className="dropdown-divider" />;
export const TablerDropdownHeader = ({ children }) => <div className="dropdown-header">{children}</div>;

// ========================================
// PROGRESS BAR
// ========================================
export const TablerProgressBar = ({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorMap = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-cyan-600',
  };

  const sizeMap = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  return (
    <div className={className}>
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizeMap[size])}>
        <div className={clsx('h-full transition-all duration-300', colorMap[color])} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <p className="text-xs text-gray-600 mt-1">{Math.round(percentage)}%</p>}
    </div>
  );
};
