'use client';

import React, { useState, Fragment, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Button from '@/components/ui/Button';
import { 
  HomeIcon,
  ShoppingBagIcon, // Added
  ShoppingCartIcon,
  TruckIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  HeartIcon,
  StarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CreditCardIcon,
  MapPinIcon,
  TagIcon,
  BanknotesIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  SparklesIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  UserCircleIcon,
  ArchiveBoxIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { user: contextUser, logout } = useAuth();
  const [user, setUser] = useState(contextUser);
  
  // Force re-render when language changes
  const [, forceUpdate] = useState(0);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate(n => n + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);
    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [i18n]);

  // Sync with localStorage — ensures admin override is detected
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // only update if role changed (like buyer → admin)
      if (parsedUser.role !== contextUser?.role) {
        setUser(parsedUser);
      }
    }
  }, [contextUser]);

  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Farmer menu items
  const farmerMenuItems: MenuItem[] = [
    {
      name: t('sidebar.dashboard'),
      href: '/farmer/dashboard',
      icon: HomeIcon
    },
    {
      name: t('sidebar.products'),
      href: '/farmer/products',
      icon: BuildingStorefrontIcon,
      children: [
        { name: t('sidebar.allProducts'), href: '/farmer/products', icon: ClipboardDocumentListIcon },
        { name: t('sidebar.addProduct'), href: '/farmer/products/new', icon: PlusIcon },
        { name: t('sidebar.categories'), href: '/farmer/products/categories', icon: DocumentTextIcon }
      ]
    },
    {
      name: t('sidebar.orders'),
      href: '/farmer/orders',
      icon: ShoppingCartIcon,
      children: [
        { name: t('sidebar.allOrders'), href: '/farmer/orders', icon: ClipboardDocumentListIcon },
        { name: t('sidebar.pendingOrders'), href: '/farmer/orders?status=pending', icon: ClockIcon },
        { name: t('sidebar.orderHistory'), href: '/farmer/orders/history', icon: DocumentTextIcon }
      ]
    },
    {
      name: t('sidebar.analytics'),
      href: '/farmer/analytics',
      icon: ChartBarIcon,
      children: [
        { name: t('sidebar.salesOverview'), href: '/farmer/analytics/sales', icon: CurrencyDollarIcon },
        { name: t('sidebar.productPerformance'), href: '/farmer/analytics/products', icon: BuildingStorefrontIcon },
        { name: t('sidebar.customerInsights'), href: '/farmer/analytics/customers', icon: UserGroupIcon }
      ]
    },
    {
      name: t('sidebar.inventory'),
      href: '/farmer/inventory',
      icon: ArchiveBoxIcon
    },
    {
      name: t('sidebar.earnings'),
      href: '/farmer/earnings',
      icon: CurrencyDollarIcon
    },
    {
      name: t('sidebar.reviews'),
      href: '/farmer/reviews',
      icon: StarIcon
    },
    {
      name: t('sidebar.certifications'),
      href: '/farmer/certifications',
      icon: DocumentCheckIcon
    },
    {
      name: t('sidebar.delivery'),
      href: '/farmer/delivery',
      icon: TruckIcon
    },
    {
      name: t('sidebar.profile'),
      href: '/farmer/profile',
      icon: UserCircleIcon
    },
    {
      name: t('sidebar.billing'),
      href: '/farmer/billing',
      icon: CurrencyDollarIcon
    },
    {
      name: t('sidebar.notifications'),
      href: '/farmer/notifications',
      icon: BellIcon,
      badge: 3
    }
  ];

  // Buyer menu items
  const buyerMenuItems: MenuItem[] = [
    {
      name: t('sidebar.marketplace'),
      href: '/buyer/marketplace',
      icon: HomeIcon
    },
    {
      name: t('sidebar.myOrders'),
      href: '/buyer/orders',
      icon: ShoppingCartIcon,
      children: [
        { name: t('sidebar.allOrders'), href: '/buyer/orders', icon: ClipboardDocumentListIcon },
        { name: t('sidebar.pendingOrders'), href: '/buyer/orders?status=pending', icon: ClockIcon },
        { name: t('sidebar.orderHistory'), href: '/buyer/orders/history', icon: DocumentTextIcon }
      ]
    },
    {
      name: t('sidebar.favorites'),
      href: '/buyer/favorites',
      icon: HeartIcon
    },
    {
      name: t('sidebar.reviews'),
      href: '/buyer/reviews',
      icon: StarIcon
    },
    {
      name: t('sidebar.payments'),
      href: '/buyer/payments',
      icon: CreditCardIcon
    },
    {
      name: t('sidebar.billing'),
      href: '/buyer/billing',
      icon: DocumentTextIcon
    },
    {
      name: t('sidebar.notifications'),
      href: '/buyer/notifications',
      icon: BellIcon,
      badge: 2
    }
  ];


    // admin menu items
  const adminMenuItems: MenuItem[] = [
    {
      name: t('sidebar.dashboard'),
      href: '/admin/dashboard',
      icon: HomeIcon
    },
    {
      name: t('sidebar.users'),
      href: '/admin/users',
      icon: UserGroupIcon
    },
    {
      name: t('sidebar.products'),
      href: '/admin/products',
      icon: BuildingStorefrontIcon,
      children: [
        { name: t('sidebar.allProducts'), href: '/admin/products', icon: ClipboardDocumentListIcon },
        { name: t('sidebar.addProduct'), href: '/admin/products/new', icon: PlusIcon },
        { name: t('sidebar.categories'), href: '/admin/products/categories', icon: DocumentTextIcon }
      ]
    },
    {
      name: t('sidebar.orders'),
      href: '/admin/orders',
      icon: ShoppingCartIcon,
      children: [
        { name: t('sidebar.allOrders'), href: '/admin/orders', icon: ClipboardDocumentListIcon },
        { name: t('sidebar.pendingOrders'), href: '/admin/orders?status=pending', icon: ClockIcon },
        { name: t('sidebar.orderHistory'), href: '/admin/orders/history', icon: DocumentTextIcon }
      ]
    },
    {
      name: t('sidebar.analytics'),
      href: '/admin/analytics',
      icon: ChartBarIcon
    },
    {
      name: t('sidebar.billing'),
      href: '/admin/billing',
      icon: BanknotesIcon
    },
    {
      name: t('sidebar.coupons'),
      href: '/admin/coupons',
      icon: TicketIcon
    },
    {
      name: t('sidebar.moderation'),
      href: '/admin/moderation',
      icon: ShieldCheckIcon
    },
    {
      name: t('sidebar.settings'),
      href: '/admin/settings',
      icon: Cog6ToothIcon
    },
    // {
    //   name: 'Reviews',
    //   href: '/admin/reviews',
    //   icon: StarIcon
    // },
    // {
    //   name: 'Notifications',
    //   href: '/admin/notifications',
    //   icon: BellIcon,
    //   badge: 3
    // }
  ];

  // Common menu it ems
  const commonMenuItems: MenuItem[] = [
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon
    },
    {
      name: 'Help & Support',
      href: '/help',
      icon: QuestionMarkCircleIcon
    }
  ];

  // const menuItems = user?.role === 'farmer' ? farmerMenuItems : buyerMenuItems ;
  // ✅ Role-based Menu Selection
let menuItems: MenuItem[] = [];

if (user?.role === 'farmer') {
  menuItems = farmerMenuItems;
} else if (user?.role === 'buyer') {
  menuItems = buyerMenuItems;
} else if (user?.role === 'admin') {
  menuItems = adminMenuItems;
}



  const handleItemClick = (item: MenuItem, event?: React.MouseEvent) => {
    if (item.children && item.children.length > 0) {
      // If it has children, toggle expansion
      toggleExpanded(item.name);
      
      // If the main item also has a valid href, navigate to it on double-click
      if (event?.detail === 2 && item.href) {
        router.push(item.href);
        onClose();
      }
    } else {
      // If it's a leaf item, navigate to the URL
      router.push(item.href);
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isItemActive = isActive(item.href);

    return (
      <div key={item.name}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
            isItemActive
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          } ${level > 0 ? 'ml-4' : ''}`}
          onClick={(e) => handleItemClick(item, e)}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`h-5 w-5 ${isItemActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className="font-medium">{item.name}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
            {hasChildren && item.href && (
              <span className="text-xs text-gray-400" title="Double-click to go to main page">
                •
              </span>
            )}
          </div>
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children!.map((child) => renderMenuItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 dark:border-gray-700 transition-colors duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">KheetiiBazaar</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{user?.role} Portal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="space-y-2">
              {menuItems.map((item) => renderMenuItem(item))}
              
              {/* Divider */}
              <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
              
              {/* Common Items */}
              {commonMenuItems.map((item) => renderMenuItem(item))}
            </nav>
          </div>

          {/* Settings & Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</span>
              <LanguageSwitcher />
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              {t('sidebar.logout')}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
