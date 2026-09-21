import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import {
  Card,
  Badge,
  Button,
  Modal,
  Input,
  PageLoader,
} from '../../components/ui';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineChevronUp, HiOutlineChevronDown, HiOutlineRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    sortOrder: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        displayName: category.displayName || '',
        sortOrder: category.sortOrder?.toString() || '',
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', displayName: '', sortOrder: '', isActive: true });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
        toast.success('Category updated');
      } else {
        await categoriesAPI.create(formData);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  const handleMove = async (id, direction) => {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= categories.length) return;

    const reordered = [...categories];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    const order = reordered.map((c, i) => ({ id: c.id, sortOrder: i }));

    try {
      await categoriesAPI.reorder(order);
      setCategories(reordered.map((c, i) => ({ ...c, sortOrder: i })));
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const handleSyncFromServices = async () => {
    setSyncing(true);
    try {
      const res = await categoriesAPI.syncFromServices();
      toast.success(res.data.message);
      fetchCategories();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage service categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSyncFromServices} loading={syncing}>
            <HiOutlineRefresh className="w-5 h-5 mr-2" />
            {syncing ? 'Syncing...' : 'Sync from Services'}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <HiOutlinePlus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-8">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Display Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sort</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Services</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-400">{index + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{category.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500">{category.displayName || '-'}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{category.sortOrder}</td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{category._count?.services || 0}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {category.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Inactive</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMove(category.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <HiOutlineChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(category.id, 'down')}
                        disabled={index === categories.length - 1}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <HiOutlineChevronDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenModal(category)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="text-center py-12 text-gray-400">No categories yet. Create one to get started.</div>
          )}
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {categories.map((category, index) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">#{index + 1}</span>
                <span className="font-medium text-sm">{category.name}</span>
                {category.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="danger">Inactive</Badge>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleMove(category.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <HiOutlineChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(category.id, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <HiOutlineChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => handleOpenModal(category)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(category.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              {category.displayName && <p>Display: {category.displayName}</p>}
              <p>Sort: {category.sortOrder} | Services: {category._count?.services || 0}</p>
            </div>
          </Card>
        ))}
        {categories.length === 0 && (
          <Card className="p-8 text-center text-gray-400">
            No categories yet. Create one to get started.
          </Card>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g., Instagram Followers"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Display Name (optional)"
            placeholder="e.g., IG Followers"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          />
          <Input
            label="Sort Order"
            type="number"
            placeholder="0 = first"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
