import { useState, useEffect } from 'react';
import { messagesAPI } from '../../services/api';
import { Card, Badge, Pagination, PageLoader } from '../../components/ui';
import { HiOutlineCheck, HiOutlineCheckCircle, HiOutlineBell } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchMessages();
  }, [pagination.page]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await messagesAPI.getMyMessages({
        page: pagination.page,
        limit: 20,
      });
      setMessages(res.data.data);
      setUnreadCount(res.data.unreadCount);
      setPagination({
        page: res.data.page,
        pages: res.data.pages,
        total: res.data.total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await messagesAPI.markAsRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await messagesAPI.markAllAsRead();
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-700',
      warning: 'bg-yellow-100 text-yellow-700',
      success: 'bg-green-100 text-green-700',
      announcement: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <HiOutlineCheckCircle className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : messages.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HiOutlineBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">You'll see notifications from admin here</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                !msg.isRead
                  ? 'border-primary-200 bg-primary-50/30'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {!msg.isRead && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(msg.type)}`}>
                      {msg.type.charAt(0).toUpperCase() + msg.type.slice(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{msg.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{msg.body}</p>
                </div>
                {!msg.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(msg.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <HiOutlineCheck className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      )}
    </div>
  );
};

export default Notifications;
