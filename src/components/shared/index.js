/**
 * Shared components exports
 */

// Original UI Components (keeping for backward compatibility)
export {
  StatCard,
  Card,
  Badge,
  Button,
  Input,
  Select,
  Table,
  ProgressBar,
  Alert,
  Avatar,
  Modal,
  Tabs,
  Pagination,
  DoseIndicator,
  usePagination,
  parseDailyDoses
} from './UIComponents';

// Tabler-styled UI Components (new design system)
export {
  TablerButton,
  TablerCard,
  TablerBadge,
  TablerTable,
  TablerInput,
  TablerSelect,
  TablerCheckbox,
  TablerRadio,
  TablerAlert,
  TablerModal,
  TablerAvatar,
  TablerAvatarList,
  TablerPagination,
  TablerDropdown,
  TablerDropdownItem,
  TablerDropdownDivider,
  TablerDropdownHeader,
  TablerProgressBar
} from './TablerUIComponents';

// Other shared components
export { default as PaymentModal } from './PaymentModal';
export { ToastContainer } from './ToastNotification';
