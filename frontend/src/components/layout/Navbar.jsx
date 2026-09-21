import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMenuAlt2, HiOutlineBell, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { messagesAPI } from '../../services/api';

const Navbar = ({ onMenuClick }) => {
  const { user, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchUnreadCount();
        }
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await messagesAPI.getUnreadCount();
      setUnreadCount(res.data?.data?.count || 0);
    } catch (err) {
      setUnreadCount(0);
    }
  };

  const handleOpenDropdown = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setMsgLoading(true);
      try {
        const res = await messagesAPI.getMyMessages({ limit: 10 });
        setMessages(res.data?.data || []);
      } catch (err) {
        setMessages([]);
      } finally {
        setMsgLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await messagesAPI.markAsRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await messagesAPI.markAllAsRead();
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-600',
      warning: 'bg-yellow-100 text-yellow-600',
      success: 'bg-green-100 text-green-600',
      announcement: 'bg-purple-100 text-purple-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <header className={`border-b sticky top-0 z-30 ${
      isAdmin
        ? 'bg-gradient-to-r from-indigo-50 to-white border-indigo-100'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <button
          className="lg:hidden text-gray-600 hover:text-gray-900"
          onClick={onMenuClick}
        >
          <HiOutlineMenuAlt2 className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-4 ml-auto">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleOpenDropdown}
              className={`relative ${isAdmin ? 'text-indigo-600 hover:text-indigo-800' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <HiOutlineBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <HiOutlineCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {msgLoading ? (
                    <div className="p-4 text-center text-gray-400">Loading...</div>
                  ) : messages.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">No notifications</div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          !msg.isRead ? 'bg-primary-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {!msg.isRead && (
                                <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                              )}
                              <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeColor(msg.type)}`}>
                                {msg.type}
                              </span>
                            </div>
                            <p className="font-medium text-sm text-gray-900">{msg.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{msg.body}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!msg.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(msg.id)}
                              className="text-gray-400 hover:text-primary-600 flex-shrink-0"
                              title="Mark as read"
                            >
                              <HiOutlineCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  to={isAdmin ? '/admin/messages' : '/notifications'}
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-3 text-center text-sm text-primary-600 hover:bg-gray-50 border-t border-gray-100"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isAdmin ? 'bg-indigo-500' : 'bg-primary-500'
            }`}>
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className={`text-xs ${isAdmin ? 'text-indigo-500' : 'text-gray-500'}`}>
                {isAdmin ? 'Administrator' : user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
