import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';
import {
  Card,
  Table,
  Badge,
  Select,
  Pagination,
  PageLoader,
  Button,
  Modal,
  Input,
} from '../../components/ui';
import toast from 'react-hot-toast';

const AdminFundRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, note: '' });

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await walletAPI.getFundRequests({
        page: pagination.page,
        limit: 30,
        status: statusFilter || undefined,
      });
      setRequests(response.data.data);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Failed to fetch fund requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await walletAPI.approveFundRequest(id, { adminNote: 'Approved' });
      toast.success('Fund request approved! Wallet credited.');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      await walletAPI.rejectFundRequest(rejectModal.id, {
        adminNote: rejectModal.note || 'Rejected',
      });
      toast.success('Fund request rejected.');
      setRejectModal({ open: false, id: null, note: '' });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
    };
    const s = config[status] || { variant: 'default', label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

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
      key: 'amount',
      title: 'Amount',
      render: (amount) => <span className="font-bold">PKR {amount.toFixed(2)}</span>,
    },
    {
      key: 'paymentMethod',
      title: 'Method',
      render: (_, row) => row.paymentMethod?.name || 'N/A',
    },
    {
      key: 'transactionId',
      title: 'Transaction ID',
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) =>
        row.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(row.id)}
              className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => setRejectModal({ open: true, id: row.id, note: '' })}
              className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fund Requests</h1>
          <p className="text-gray-500 mt-1">Review and approve user fund requests</p>
        </div>
        <div className="mt-4 md:mt-0 w-full md:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            options={statusOptions}
          />
        </div>
      </div>

      <Card>
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <Table columns={columns} data={requests} emptyMessage="No fund requests found" />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            />
          </>
        )}
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: null, note: '' })}
        title="Reject Fund Request"
      >
        <div className="space-y-4">
          <Input
            label="Reason (Optional)"
            placeholder="Enter reason for rejection"
            value={rejectModal.note}
            onChange={(e) => setRejectModal((prev) => ({ ...prev, note: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal({ open: false, id: null, note: '' })}>
              Cancel
            </Button>
            <Button className="bg-red-500 hover:bg-red-600" onClick={handleReject}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminFundRequests;
