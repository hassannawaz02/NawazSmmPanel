import { useState, useEffect } from 'react';
import { walletAPI, paymentMethodAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge, Pagination, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';

const AddFunds = () => {
  const { user, updateUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchPaymentMethods();
    fetchMyRequests();
  }, [pagination.page]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentMethodAPI.getAll();
      setPaymentMethods(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setHistoryLoading(true);
    try {
      const response = await walletAPI.getMyFundRequests({
        page: pagination.page,
        limit: 10,
      });
      setMyRequests(response.data.data);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setTransactionId('');
    setAmount('');
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum < selectedMethod.minAmount) {
      toast.error(`Minimum amount is PKR ${selectedMethod.minAmount}`);
      return;
    }

    if (amountNum > selectedMethod.maxAmount) {
      toast.error(`Maximum amount is PKR ${selectedMethod.maxAmount}`);
      return;
    }

    setSubmitting(true);

    try {
      await walletAPI.createFundRequest({
        paymentMethodId: selectedMethod.id,
        amount: amountNum,
        transactionId: transactionId.trim(),
      });

      toast.success('Fund request submitted! Waiting for admin approval.');
      setTransactionId('');
      setAmount('');
      setSelectedMethod(null);
      fetchMyRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
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

  if (loading) return <PageLoader />;

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Add Funds</h1>
        <p className="text-gray-500 mt-1">Add money to your wallet</p>
      </div>

      {/* Current Balance */}
      <div className="bg-primary-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600">Current Balance</p>
        <p className="text-2xl font-bold text-primary-600">
          PKR {user?.walletBalance?.toFixed(2) || '0.00'}
        </p>
      </div>

      {/* Payment Methods - Grid Layout */}
      <p className="text-sm font-medium text-gray-700 mb-2">Select Payment Method</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method)}
            className={`border-2 rounded-lg p-3 text-center transition-all ${
              selectedMethod?.id === method.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 bg-white'
            }`}
          >
            {method.logo ? (
              <img src={method.logo} alt={method.name} className="h-8 mx-auto mb-1 object-contain" />
            ) : (
              <div className="h-8 flex items-center justify-center mb-1">
                <span className="text-lg">💰</span>
              </div>
            )}
            <p className="text-xs font-medium text-gray-700 truncate">{method.name}</p>
          </button>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center mb-4">
          <p className="text-gray-500">No payment methods available. Contact admin.</p>
        </div>
      )}

      {/* Selected Method Details */}
      {selectedMethod && (
        <div className="space-y-3">
          {/* Account Info Card */}
          <div className="bg-gray-500 text-white rounded-lg p-4">
            <h3 className="text-yellow-400 text-center font-semibold text-sm">Account Number</h3>
            <p className="text-center text-xl font-bold mt-1">{selectedMethod.accountNumber}</p>

            <h3 className="text-yellow-400 text-center font-semibold text-sm mt-3">Account Title</h3>
            <p className="text-center font-semibold mt-1">{selectedMethod.accountTitle}</p>

            <h3 className="text-yellow-400 text-center font-semibold text-sm mt-3">Instructions</h3>
            <div className="text-center text-xs mt-2 space-y-0.5">
              <p>Step 1: Pay us on the given Number</p>
              <p>Step 2: Copy the Transaction Id and paste it below</p>
              <p>Step 3: Enter the amount and hit submit</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-gray-500">Min</p>
                <p className="font-semibold">{selectedMethod.minAmount}</p>
              </div>
              <div>
                <p className="text-gray-500">Max</p>
                <p className="font-semibold">{selectedMethod.maxAmount}</p>
              </div>
              <div>
                <p className="text-gray-500">Fee</p>
                <p className="font-semibold">{selectedMethod.fee}%</p>
              </div>
            </div>
          </div>

          {/* Transaction ID Input */}
          <div>
            <label className="block text-sm font-medium text-green-600 mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              placeholder="Enter Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-green-600 mb-1">Amount [PKR]</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={selectedMethod.minAmount}
              max={selectedMethod.maxAmount}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}

      {/* Fund Requests History */}
      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">My Fund Requests</h2>
        {historyLoading ? (
          <PageLoader />
        ) : (
          <>
            {myRequests.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No requests yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">PKR {req.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{req.paymentMethod?.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{req.transactionId}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(req.status)}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AddFunds;
