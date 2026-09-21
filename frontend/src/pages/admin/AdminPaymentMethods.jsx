import { useState, useEffect } from 'react';
import { paymentMethodAPI } from '../../services/api';
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

const AdminPaymentMethods = () => {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    accountTitle: '',
    logo: '',
    minAmount: '50',
    maxAmount: '10000',
    fee: '0',
    isActive: true,
    instructions: '',
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const response = await paymentMethodAPI.getAll();
      setMethods(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        accountNumber: method.accountNumber,
        accountTitle: method.accountTitle,
        logo: method.logo || '',
        minAmount: method.minAmount.toString(),
        maxAmount: method.maxAmount.toString(),
        fee: method.fee.toString(),
        isActive: method.isActive,
        instructions: method.instructions || '',
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        accountNumber: '',
        accountTitle: '',
        logo: '',
        minAmount: '50',
        maxAmount: '10000',
        fee: '0',
        isActive: true,
        instructions: '',
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
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
        fee: parseFloat(formData.fee),
        logo: formData.logo || null,
        instructions: formData.instructions || null,
      };

      if (editingMethod) {
        await paymentMethodAPI.update(editingMethod.id, data);
        toast.success('Payment method updated');
      } else {
        await paymentMethodAPI.create(data);
        toast.success('Payment method created');
      }

      setModalOpen(false);
      fetchMethods();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;

    try {
      await paymentMethodAPI.delete(id);
      toast.success('Payment method deleted');
      fetchMethods();
    } catch (error) {
      toast.error('Failed to delete payment method');
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Method',
      render: (name) => <span className="font-medium">{name}</span>,
    },
    { key: 'accountNumber', title: 'Account Number' },
    { key: 'accountTitle', title: 'Account Title' },
    {
      key: 'minAmount',
      title: 'Min/Max',
      render: (_, row) => `PKR ${row.minAmount} / ${row.maxAmount}`,
    },
    {
      key: 'fee',
      title: 'Fee',
      render: (fee) => `${fee}%`,
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
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-500 mt-1">Manage EasyPaisa, JazzCash and other payment methods</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <HiOutlinePlus className="w-5 h-5 mr-2" />
          Add Method
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={methods}
          emptyMessage="No payment methods configured yet"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Method Name"
              placeholder="e.g., JazzCash"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Account Number"
              placeholder="e.g., 03257911341"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              required
            />
          </div>

          <Input
            label="Account Title"
            placeholder="e.g., Muhammad Saif"
            value={formData.accountTitle}
            onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
            required
          />

          <Input
            label="Logo URL (Optional)"
            placeholder="https://example.com/jazzcash-logo.png"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Minimum Amount"
              type="number"
              value={formData.minAmount}
              onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
              required
            />
            <Input
              label="Maximum Amount"
              type="number"
              value={formData.maxAmount}
              onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
              required
            />
            <Input
              label="Fee %"
              type="number"
              step="0.01"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Instructions (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Payment instructions for users..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (visible to users)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingMethod ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPaymentMethods;
