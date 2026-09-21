import { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import {
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Input,
  PageLoader,
} from '../../components/ui';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    text: '',
    rating: '5',
    isActive: true,
    sortOrder: '0',
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getAllAdmin();
      setReviews(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (review = null) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        name: review.name,
        avatar: review.avatar || '',
        text: review.text,
        rating: review.rating.toString(),
        isActive: review.isActive,
        sortOrder: review.sortOrder.toString(),
      });
    } else {
      setEditingReview(null);
      setFormData({
        name: '',
        avatar: '',
        text: '',
        rating: '5',
        isActive: true,
        sortOrder: '0',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        rating: parseInt(formData.rating),
        sortOrder: parseInt(formData.sortOrder),
        avatar: formData.avatar || null,
      };

      if (editingReview) {
        await reviewsAPI.update(editingReview.id, data);
        toast.success('Review updated');
      } else {
        await reviewsAPI.create(data);
        toast.success('Review created');
      }

      setModalOpen(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewsAPI.delete(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      key: 'text',
      title: 'Review',
      render: (text) => <span className="text-sm text-gray-600 line-clamp-2">{text}</span>,
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (rating) => <span>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>,
    },
    {
      key: 'sortOrder',
      title: 'Order',
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (isActive) => (
        <Badge variant={isActive ? 'success' : 'danger'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <HiOutlinePencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-500 mt-1">Manage reviews shown on homepage</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <HiOutlinePlus className="w-5 h-5 mr-2" />
          Add Review
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={reviews} emptyMessage="No reviews yet" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingReview ? 'Edit Review' : 'Add Review'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer Name"
            placeholder="e.g., Ahmed Khan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Avatar URL (Optional)"
            placeholder="https://example.com/avatar.jpg"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
            <textarea
              rows={3}
              placeholder="Customer review..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Stars</option>
                ))}
              </select>
            </div>
            <Input
              label="Sort Order"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingReview ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminReviews;
