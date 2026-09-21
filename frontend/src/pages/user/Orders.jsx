import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { Card, Badge, Pagination, Select, PageLoader } from '../../components/ui';

const Orders = () => {
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
      const response = await ordersAPI.getAll({
        page: pagination.page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setOrders(response.data.data);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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

  const columns = [
    {
      key: 'orderNumber',
      title: 'Order ID',
      render: (orderNumber) => (
        <span className="font-mono text-xs">#{orderNumber}</span>
      ),
    },
    {
      key: 'service',
      title: 'Service',
      render: (_, row) => (
        <div className="max-w-[200px]">
          <p className="font-medium truncate" title={row.service?.title || 'Deleted Service'}>{row.service?.title || 'Deleted Service'}</p>
          <p className="text-xs text-gray-500 truncate">{row.service?.category || 'N/A'}</p>
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
          className="text-primary-600 hover:underline truncate block max-w-[200px]"
        >
          {link}
        </a>
      ),
    },
    { key: 'quantity', title: 'Quantity' },
    {
      key: 'amount',
      title: 'Amount',
      render: (amount) => <span className="font-medium">PKR {amount.toFixed(2)}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

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

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500 mt-1">{orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''} found` : 'View all your orders'}</p>
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
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No orders found</div>
        ) : (
          <>
            {/* Mobile: Card List */}
            <div className="md:hidden space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-gray-900">#{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div style={{ whiteSpace: 'pre-line' }}>
                      <span className="font-medium text-gray-900">{order.service?.title || 'Deleted Service'}</span>
                    </div>
                    <div>
                      <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-xs break-all">{order.link}</a>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Qty: <span className="font-medium text-gray-900">{order.quantity}</span></span>
                      <span className="font-bold text-primary-600">PKR {order.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Service</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Link</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-xs">#{order.orderNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{order.service?.title || 'Deleted Service'}</p>
                        <p className="text-xs text-gray-500">{order.service?.category || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate block max-w-[200px]">{order.link}</a>
                      </td>
                      <td className="py-3 px-4">{order.quantity}</td>
                      <td className="py-3 px-4 font-medium">PKR {order.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {!loading && orders.length > 0 && (
        <div className="mt-4">
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

export default Orders;
