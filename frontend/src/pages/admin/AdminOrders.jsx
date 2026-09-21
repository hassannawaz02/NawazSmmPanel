import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import {
  Card,
  Table,
  Badge,
  Select,
  Pagination,
  PageLoader,
} from '../../components/ui';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAllAdmin({
        page: pagination.page,
        limit: 30,
        status: statusFilter || undefined,
      });
      setOrders(response.data.data);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pending' },
      processing: { variant: 'info', label: 'Processing' },
      in_progress: { variant: 'info', label: 'In Progress' },
      completed: { variant: 'success', label: 'Completed' },
      partial: { variant: 'warning', label: 'Partial' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
      refunded: { variant: 'danger', label: 'Refunded' },
    };

    const config = statusConfig[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'partial', label: 'Partial' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const columns = [
    {
      key: 'orderNumber',
      title: 'Order ID',
      render: (orderNumber) => <span className="font-mono text-xs">#{orderNumber}</span>,
    },
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
      key: 'service',
      title: 'Service',
      render: (_, row) => (
        <div className="max-w-[200px]">
          <p className="font-medium truncate">{row.service?.title || 'Deleted Service'}</p>
          <p className="text-xs text-gray-500">{row.service?.category || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'link',
      title: 'Link',
      render: (link) => (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline truncate block max-w-[150px]"
        >
          {link}
        </a>
      ),
    },
    { key: 'quantity', title: 'Qty' },
    {
      key: 'amount',
      title: 'Amount',
      render: (amount) => `PKR ${amount.toFixed(2)}`,
    },
    {
      key: 'profit',
      title: 'Profit',
      render: (profit, row) => (
        <span className={`font-semibold ${profit > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          PKR {(profit || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (status, row) => (
        <select
          value={status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {statusOptions.slice(1).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'providerOrderId',
      title: 'Provider ID',
      render: (id) => (
        <span className="font-mono text-xs">{id || '-'}</span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
          <p className="text-gray-500 mt-1">
            {orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''} found` : 'Manage and track all customer orders'}
          </p>
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
            {/* Mobile Card List */}
            <div className="md:hidden space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-gray-900">#{order.orderNumber}</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {statusOptions.slice(1).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 truncate">{order.service?.title || 'Deleted Service'}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                    <span>Qty: <span className="font-medium text-gray-900">{order.quantity}</span></span>
                    <span>Amount: <span className="font-medium text-gray-900">PKR {order.amount.toFixed(2)}</span></span>
                    <span className={`${(order.profit || 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      Profit: PKR {(order.profit || 0).toFixed(2)}
                    </span>
                  </div>
                  {order.providerOrderId && (
                    <p className="text-xs text-gray-400 mt-1">Provider ID: {order.providerOrderId}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {orders.length === 0 && <div className="text-center py-8 text-gray-500">No orders found</div>}
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table
                columns={columns}
                data={orders}
                emptyMessage="No orders found"
              />
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminOrders;
