import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, walletAPI } from '../../services/api';
import { Card, StatCard, Table, Badge, PageLoader } from '../../components/ui';
import {
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineCash,
  HiOutlineCollection,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp,
  HiOutlineArrowRight,
} from 'react-icons/hi';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashboardRes, transactionsRes] = await Promise.all([
        adminAPI.getDashboard(),
        walletAPI.getAllTransactions({ limit: 5 }),
      ]);
      setStats(dashboardRes.data.data);
      setRecentTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
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
      render: (orderNumber) => <span className="font-mono text-xs">#{orderNumber}</span>,
    },
    {
      key: 'user',
      title: 'User',
      render: (_, row) => row.user?.name || 'N/A',
    },
    {
      key: 'service',
      title: 'Service',
      render: (_, row) => row.service?.title || 'Deleted Service',
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (amount) => `PKR ${amount.toFixed(2)}`,
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => getStatusBadge(status),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your panel overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <HiOutlineUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <HiOutlineCheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{stats?.users?.active || 0} active</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.orders?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <HiOutlineShoppingCart className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <HiOutlineClock className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-yellow-600">{stats?.orders?.pending || 0} pending</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">PKR {stats?.revenue?.total?.toFixed(0) || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <HiOutlineTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <HiOutlineCash className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">PKR {stats?.revenue?.today?.toFixed(0) || 0} today</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-2xl font-bold text-green-600">PKR {stats?.profit?.total?.toFixed(0) || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <HiOutlineCash className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <HiOutlineTrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">PKR {stats?.profit?.today?.toFixed(0) || 0} today</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.services?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <HiOutlineCollection className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <HiOutlineCheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{stats?.services?.active || 0} active</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.orders?.today || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <HiOutlineExclamationCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <HiOutlineTrendingUp className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-orange-600">PKR {stats?.revenue?.today?.toFixed(0) || 0} earned</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <Link
          to="/admin/orders"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
            <HiOutlineShoppingCart className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">All Orders</h3>
          </div>
          <HiOutlineArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
        </Link>

        <Link
          to="/admin/services"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <HiOutlineCollection className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Services</h3>
          </div>
          <HiOutlineArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
        </Link>

        <Link
          to="/admin/users"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <HiOutlineUsers className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Users</h3>
          </div>
          <HiOutlineArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link
          to="/admin/add-funds"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
            <HiOutlineCash className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Add Funds</h3>
          </div>
          <HiOutlineArrowRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 transition-colors" />
        </Link>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders by Status */}
        <Card title="Orders by Status">
          <div className="space-y-3">
            {stats?.orders?.byStatus?.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  {getStatusBadge(item._id)}
                </div>
                <span className="font-bold text-lg">{item.count}</span>
              </div>
            ))}
            {(!stats?.orders?.byStatus || stats.orders.byStatus.length === 0) && (
              <p className="text-center text-gray-400 py-4">No orders yet</p>
            )}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card title="Recent Transactions" className="lg:col-span-2">
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <HiOutlineCash className={`w-5 h-5 ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{tx.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}PKR {tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-center text-gray-400 py-4">No transactions yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card
        title="Recent Orders"
        action={
          <Link to="/admin/orders" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
            View All <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        }
      >
        {/* Mobile Card List */}
        <div className="md:hidden space-y-3">
          {(stats?.recentOrders || []).map((order) => (
            <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-gray-900">#{order.orderNumber}</span>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{order.user?.name || 'N/A'}</p>
              <p className="text-xs text-gray-500 truncate">{order.service?.title || 'Deleted Service'}</p>
              <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-sm font-bold text-indigo-600">PKR {order.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {(stats?.recentOrders || []).length === 0 && (
            <div className="text-center py-8 text-gray-500">No recent orders</div>
          )}
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={stats?.recentOrders || []}
            emptyMessage="No recent orders"
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
