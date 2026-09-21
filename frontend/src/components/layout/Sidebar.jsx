import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import {
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineShoppingCart,
  HiOutlineClipboardList,
  HiOutlineCollection,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineCash,
  HiOutlineLogout,
  HiOutlineX,
  HiOutlineBell,
  HiOutlineMail,
  HiOutlineStar,
  HiOutlineGlobe,
  HiOutlineChartBar,
  HiOutlineTag,
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const location = useLocation();

  const userMenuItems = [
    { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { path: '/new-order', icon: HiOutlineShoppingCart, label: 'New Order' },
    { path: '/orders', icon: HiOutlineClipboardList, label: 'Order History' },
    { path: '/my-services', icon: HiOutlineCollection, label: 'Services' },
    { path: '/add-funds', icon: HiOutlineCreditCard, label: 'Add Funds' },
    { path: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
    { path: '/profile', icon: HiOutlineUser, label: 'Profile' },
  ];

  const adminMenuItems = [
    { path: '/admin', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { path: '/admin/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
    { path: '/admin/orders', icon: HiOutlineClipboardList, label: 'All Orders' },
    { path: '/admin/services', icon: HiOutlineCollection, label: 'Manage Services' },
    { path: '/admin/categories', icon: HiOutlineTag, label: 'Categories' },
    { path: '/admin/users', icon: HiOutlineUsers, label: 'Manage Users' },
    { path: '/admin/fund-requests', icon: HiOutlineCash, label: 'Fund Requests' },
    { path: '/admin/payment-methods', icon: HiOutlineCreditCard, label: 'Payment Methods' },
    { path: '/admin/reviews', icon: HiOutlineStar, label: 'Reviews' },
    { path: '/admin/providers', icon: HiOutlineGlobe, label: 'Providers' },
    { path: '/admin/add-funds', icon: HiOutlineCash, label: 'Add Funds (Manual)' },
    { path: '/admin/messages', icon: HiOutlineMail, label: 'Messages' },
    { path: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isAdmin
            ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900'
            : 'bg-dark-200'
        } text-white`}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${isAdmin ? 'border-indigo-800/50' : 'border-gray-700'}`}>
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-indigo-500' : 'bg-primary-500'}`}>
              <span className="text-white font-bold">{isAdmin ? 'A' : 'S'}</span>
            </div>
            <span className="text-xl font-bold">{isAdmin ? 'Admin Panel' : settings.siteName}</span>
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* User info */}
        <div className={`px-6 py-4 border-b ${isAdmin ? 'border-indigo-800/50' : 'border-gray-700'}`}>
          <p className="text-sm text-gray-400">Welcome,</p>
          <p className="font-semibold truncate">{user?.name}</p>
          {!isAdmin && (
            <p className="text-sm text-primary-400 mt-1">
              Balance: PKR {user?.walletBalance?.toFixed(2) || '0.00'}
            </p>
          )}
          {isAdmin && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded">
              Administrator
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 flex-1 overflow-y-auto">
          {isAdmin && (
            <p className="px-4 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Management</p>
          )}
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? isAdmin
                        ? 'bg-indigo-600 text-white'
                        : 'bg-primary-600 text-white'
                      : isAdmin
                        ? 'text-gray-300 hover:bg-indigo-900/50 hover:text-white'
                        : 'text-gray-300 hover:bg-dark-100 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className={`px-4 py-4 border-t ${isAdmin ? 'border-indigo-800/50' : 'border-gray-700'}`}>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
