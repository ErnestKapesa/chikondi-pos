// Modern Professional Icons for Chikondi POS
import {
  // Navigation & UI
  Home,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  
  // Business & Finance
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calculator,
  Receipt,
  
  // Shopping & Sales
  ShoppingCart,
  ShoppingBag,
  Package,
  Package2,
  PackageCheck,
  PackageX,
  Scan,
  QrCode,
  
  // People & Users
  User,
  Users,
  UserPlus,
  UserCheck,
  Crown,
  
  // Communication
  Phone,
  Mail,
  MessageCircle,
  Send,
  Share,
  Printer,
  
  // Status & Alerts
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  
  // Time & Calendar
  Clock,
  Calendar,
  CalendarDays,
  
  // Technology
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Cloud,
  CloudOff,
  RefreshCw,
  
  // Actions
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  
  // Arrows & Navigation
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  
  // Security
  Lock,
  Unlock,
  Shield,
  Key,
  
  // Location & Places
  MapPin,
  Store,
  Building,
  
  // Miscellaneous
  Star,
  Heart,
  Flag,
  Tag,
  Tags,
  Bookmark,
  FileText,
  Image,
  Camera
} from 'lucide-react';

// Icon mapping for consistent usage across the app
export const Icons = {
  // Navigation
  home: Home,
  settings: Settings,
  menu: Menu,
  close: X,
  
  // Business Operations
  sales: ShoppingCart,
  inventory: Package,
  expenses: CreditCard,
  reports: BarChart3,
  dashboard: PieChart,
  
  // Money & Currency
  money: DollarSign,
  cash: Wallet,
  mobilePayment: Smartphone,
  profit: TrendingUp,
  loss: TrendingDown,
  
  // Products & Stock
  product: Package2,
  lowStock: PackageX,
  inStock: PackageCheck,
  barcode: Scan,
  qrCode: QrCode,
  
  // Customers & Users
  customer: User,
  customers: Users,
  addCustomer: UserPlus,
  employee: UserCheck,
  owner: Crown,
  
  // Actions
  add: Plus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  cancel: X,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  view: Eye,
  hide: EyeOff,
  
  // Communication
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  share: Share,
  print: Printer,
  
  // Status
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  notification: Bell,
  
  // Connectivity
  online: Wifi,
  offline: WifiOff,
  sync: RefreshCw,
  cloud: Cloud,
  
  // Time
  time: Clock,
  calendar: Calendar,
  
  // Security
  lock: Lock,
  unlock: Unlock,
  security: Shield,
  pin: Key,
  
  // Location
  location: MapPin,
  shop: Store,
  building: Building,
  
  // Miscellaneous
  receipt: Receipt,
  star: Star,
  heart: Heart,
  tag: Tag,
  file: FileText,
  camera: Camera
};

// Icon component with consistent sizing and styling
export function Icon({ 
  name, 
  size = 20, 
  className = "", 
  color = "currentColor",
  ...props 
}) {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      color={color}
      className={className}
      {...props}
    />
  );
}

// Predefined icon sizes for consistency
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48
};

// Common icon combinations for the app
export const AppIcons = {
  // Navigation icons with labels
  navigation: {
    home: { icon: 'home', label: 'Home' },
    sales: { icon: 'sales', label: 'Sales' },
    inventory: { icon: 'inventory', label: 'Stock' },
    expenses: { icon: 'expenses', label: 'Expenses' },
    reports: { icon: 'reports', label: 'Reports' }
  },
  
  // Payment method icons
  payments: {
    cash: { icon: 'cash', label: 'Cash' },
    mobile: { icon: 'mobilePayment', label: 'Mobile Money' },
    card: { icon: 'money', label: 'Card' }
  },
  
  // Status indicators
  status: {
    online: { icon: 'online', label: 'Online', color: 'text-green-600' },
    offline: { icon: 'offline', label: 'Offline', color: 'text-red-600' },
    syncing: { icon: 'sync', label: 'Syncing', color: 'text-blue-600' }
  }
};

export default Icon;