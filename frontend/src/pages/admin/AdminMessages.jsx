import { useState, useEffect } from 'react';
import { messagesAPI, adminAPI } from '../../services/api';
import {
  Card,
  Button,
  Input,
  Table,
  Modal,
  Badge,
  Pagination,
  PageLoader,
} from '../../components/ui';
import {
  HiOutlinePaperAirplane,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineSearch,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminMessages = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('send');

  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    body: '',
    type: 'info',
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    body: '',
    type: 'info',
  });

  useEffect(() => {
    fetchMessages();
  }, [pagination.page]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await messagesAPI.getAllMessages({
        page: pagination.page,
        limit: 20,
      });
      setMessages(res.data.data);
      setPagination({
        page: res.data.page,
        pages: res.data.pages,
        total: res.data.total,
      });
    } catch (err) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!searchUser) return;
    try {
      const res = await adminAPI.getUsers({ search: searchUser, limit: 10 });
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to search users');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.title || !formData.body) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      await messagesAPI.sendMessage(formData);
      toast.success('Message sent successfully');
      setFormData({ userId: '', title: '', body: '', type: 'info' });
      setModalOpen(false);
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast.error('Please fill title and message');
      return;
    }
    setSubmitting(true);
    try {
      const res = await messagesAPI.broadcastMessage({
        title: formData.title,
        body: formData.body,
        type: formData.type,
      });
      toast.success(`Message broadcasted to ${res.data.data.sent} users`);
      setFormData({ userId: '', title: '', body: '', type: 'info' });
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await messagesAPI.updateMessage(editingMsg.id, editFormData);
      toast.success('Message updated');
      setEditModal(false);
      fetchMessages();
    } catch (err) {
      toast.error('Failed to update message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await messagesAPI.deleteMessage(id);
      toast.success('Message deleted');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const getTypeBadge = (type) => {
    const config = {
      info: { variant: 'info', label: 'Info' },
      warning: { variant: 'warning', label: 'Warning' },
      success: { variant: 'success', label: 'Success' },
      announcement: { variant: 'primary', label: 'Announcement' },
    };
    const c = config[type] || { variant: 'default', label: type };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const columns = [
    {
      key: 'user',
      title: 'User',
      render: (_, row) => (
        <div>
          <p className="font-medium">{row.user?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'title',
      title: 'Title',
      render: (title) => <span className="font-medium">{title}</span>,
    },
    {
      key: 'body',
      title: 'Message',
      render: (body) => (
        <span className="text-sm text-gray-600 line-clamp-1 max-w-[200px] block">{body}</span>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (type) => getTypeBadge(type),
    },
    {
      key: 'isRead',
      title: 'Status',
      render: (isRead) => (
        <Badge variant={isRead ? 'success' : 'warning'}>
          {isRead ? 'Read' : 'Unread'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingMsg(row);
              setEditFormData({ title: row.title, body: row.body, type: row.type });
              setEditModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Send and manage notifications to users</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button onClick={() => { setModalOpen(true); setActiveTab('send'); }}>
            <HiOutlinePaperAirplane className="w-4 h-4 mr-2" /> Send Message
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'send'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Send Message
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'broadcast'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <HiOutlineUsers className="w-4 h-4 mr-1 inline" /> Broadcast
        </button>
      </div>

      {/* Send / Broadcast Form */}
      <Card className="mb-6">
        {activeTab === 'send' ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button type="button" onClick={handleSearchUser}>
                  <HiOutlineSearch className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {users.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, userId: u.id })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.userId === u.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </button>
                ))}
              </div>
            )}
            <Input
              label="Title"
              placeholder="Notification title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={3}
                placeholder="Write your message..."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <Button type="submit" loading={submitting} disabled={!formData.userId}>
              <HiOutlinePaperAirplane className="w-4 h-4 mr-2" /> Send to User
            </Button>
          </form>
        ) : (
          <form onSubmit={handleBroadcast} className="space-y-4">
            <Input
              label="Title"
              placeholder="Broadcast title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={3}
                placeholder="Write your broadcast message..."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="announcement">Announcement</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
            </div>
            <Button type="submit" loading={submitting} className="bg-purple-600 hover:bg-purple-700">
              <HiOutlineUsers className="w-4 h-4 mr-2" /> Broadcast to All Users
            </Button>
          </form>
        )}
      </Card>

      {/* Messages List */}
      <Card title={`All Messages (${pagination.total})`}>
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <Table columns={columns} data={messages} emptyMessage="No messages sent yet" />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            />
          </>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Message">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Title"
            value={editFormData.title}
            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              rows={3}
              value={editFormData.body}
              onChange={(e) => setEditFormData({ ...editFormData, body: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={editFormData.type}
              onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Update</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMessages;
