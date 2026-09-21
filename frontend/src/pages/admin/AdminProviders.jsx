import { useState, useEffect } from 'react';
import { providerAPI } from '../../services/api';
import {
  Card,
  Badge,
  Button,
  Modal,
  Input,
  PageLoader,
} from '../../components/ui';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminProviders = () => {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    apiUrl: '',
    apiKey: '',
    isActive: true,
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await providerAPI.getAll();
      setProviders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEnv = async () => {
    try {
      const res = await providerAPI.syncEnv();
      toast.success(res.data.message || 'Env provider synced');
      fetchProviders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Sync failed');
    }
  };

  const handleOpenModal = (provider = null) => {
    if (provider && !provider.isEnvDefault) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        apiUrl: provider.apiUrl,
        apiKey: provider.apiKey,
        isActive: provider.isActive,
      });
    } else {
      setEditingProvider(null);
      setFormData({ name: '', apiUrl: '', apiKey: '', isActive: true });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingProvider) {
        await providerAPI.update(editingProvider.id, formData);
        toast.success('Provider updated');
      } else {
        await providerAPI.create(formData);
        toast.success('Provider created');
      }
      setModalOpen(false);
      fetchProviders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this provider?')) return;
    try {
      await providerAPI.delete(id);
      toast.success('Provider deleted');
      fetchProviders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
          <p className="text-gray-500 mt-1">Manage SMM service providers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSyncEnv}>
            <HiOutlineRefresh className="w-5 h-5 mr-2" />
            Sync Env Provider
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <HiOutlinePlus className="w-5 h-5 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">API URL</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">API Key</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Services</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium">{provider.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500 truncate block max-w-[250px]">{provider.apiUrl}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs">{provider.isEnvDefault ? provider.apiKey : (provider.apiKey?.slice(0, 10) + '...')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span>{provider._count?.services || 0}</span>
                  </td>
                  <td className="py-3 px-4">
                    {provider.isEnvDefault ? (
                      <Badge variant="info">ENV Default</Badge>
                    ) : provider.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Inactive</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {provider.isEnvDefault ? (
                      <span className="text-xs text-gray-400 italic">Read-only</span>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenModal(provider)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(provider.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {providers.map((provider) => (
          <Card key={provider.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{provider.name}</span>
                {provider.isEnvDefault ? (
                  <Badge variant="info">ENV</Badge>
                ) : provider.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="danger">Inactive</Badge>
                )}
              </div>
              {!provider.isEnvDefault && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(provider)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(provider.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p className="truncate">URL: {provider.apiUrl}</p>
              <p className="font-mono">Key: {provider.isEnvDefault ? provider.apiKey : (provider.apiKey?.slice(0, 10) + '...')}</p>
              <p>Services: {provider._count?.services || 0}</p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProvider ? 'Edit Provider' : 'Add Provider'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Provider Name"
            placeholder="e.g., WorldPanel24"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="API URL"
            placeholder="https://example.com/api/v2"
            value={formData.apiUrl}
            onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
            required
          />
          <Input
            label="API Key"
            placeholder="Enter provider API key"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            required
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
              {editingProvider ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProviders;
