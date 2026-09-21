import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card, Badge, PageLoader } from '../../components/ui';
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCash,
  HiOutlineShoppingCart,
  HiOutlineGlobe,
  HiOutlineRefresh,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineMinus,
  HiOutlinePrinter,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineCalendar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const periods = [
  { value: 'today', label: 'Aaj' },
  { value: '7d', label: '7 Din' },
  { value: '15d', label: '15 Din' },
  { value: '1m', label: '1 Mahina' },
  { value: '3m', label: '3 Mahine' },
  { value: '6m', label: '6 Mahine' },
  { value: '1y', label: '1 Saal' },
  { value: 'all', label: 'Sab Kuch' },
];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [overview, setOverview] = useState(null);
  const [daily, setDaily] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [providerData, setProviderData] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetchAll();
  }, [period]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [overviewRes, dailyRes, catRes, svcRes, provRes, growthRes, hourlyRes, usersRes] = await Promise.all([
        adminAPI.getFinancialOverview(period),
        adminAPI.getDailyBreakdown(period),
        adminAPI.getCategoryBreakdown(period),
        adminAPI.getServiceBreakdown(period, 10),
        adminAPI.getProviderSpending(period),
        adminAPI.getGrowthComparison(period),
        adminAPI.getHourlyAndWeekday(period),
        adminAPI.getTopUsers(period, 10),
      ]);
      setOverview(overviewRes.data.data);
      setDaily(dailyRes.data.data);
      setCategories(catRes.data.data);
      setTopServices(svcRes.data.data);
      setProviderData(provRes.data.data);
      setGrowth(growthRes.data.data);
      setHourlyData(hourlyRes.data.data);
      setTopUsers(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (num) => {
    if (num === undefined || num === null) return 'PKR 0';
    if (num >= 1000000) return `PKR ${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `PKR ${(num / 1000).toFixed(1)}K`;
    return `PKR ${num.toFixed(2)}`;
  };

  const fmtShort = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const GrowthBadge = ({ value }) => {
    if (value === 0) return <span className="text-gray-400 text-xs flex items-center gap-0.5"><HiOutlineMinus className="w-3 h-3" />0%</span>;
    if (value > 0) return <span className="text-green-600 text-xs font-medium flex items-center gap-0.5"><HiOutlineArrowUp className="w-3 h-3" />{value}%</span>;
    return <span className="text-red-600 text-xs font-medium flex items-center gap-0.5"><HiOutlineArrowDown className="w-3 h-3" />{Math.abs(value)}%</span>;
  };

  const handlePrint = () => window.print();

  if (loading && !overview) return <PageLoader />;

  const maxDailyRevenue = daily.length > 0 ? Math.max(...daily.map((d) => d.revenue)) : 1;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-500 mt-1">Revenue, spending, profit - complete breakdown</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button onClick={fetchAll} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Refresh">
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          <button onClick={handlePrint} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Print">
            <HiOutlinePrinter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {overview && (
        <>
          {/* Growth Comparison Cards */}
          {growth && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { label: 'Revenue', curr: growth.current.revenue, prev: growth.previous.revenue, growthVal: growth.growth.revenue, color: 'blue' },
                { label: 'Profit', curr: growth.current.profit, prev: growth.previous.profit, growthVal: growth.growth.profit, color: 'green' },
                { label: 'Orders', curr: growth.current.total, prev: growth.previous.total, growthVal: growth.growth.orders, color: 'purple', isInt: true },
                { label: 'Avg Order', curr: growth.current.avgOrder, prev: growth.previous.avgOrder, growthVal: growth.growth.avgOrder, color: 'primary' },
                { label: 'Refund Rate', curr: growth.current.refundRate, prev: growth.previous.refundRate, growthVal: null, color: 'red', suffix: '%' },
              ].map((item) => (
                <Card key={item.label} className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 uppercase">{item.label}</p>
                    {item.growthVal !== null && <GrowthBadge value={item.growthVal} />}
                  </div>
                  <p className={`text-lg font-bold text-${item.color}-600`}>
                    {item.isInt ? item.curr : fmt(item.curr)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Pichla: {item.isInt ? item.prev : (item.suffix ? `${item.prev}${item.suffix}` : fmt(item.prev))}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineCash className="w-5 h-5 text-blue-500" />
                <p className="text-xs text-gray-500 uppercase">Revenue</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(overview.totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">{overview.totalOrders} orders</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineGlobe className="w-5 h-5 text-orange-500" />
                <p className="text-xs text-gray-500 uppercase">API Cost</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(overview.totalCost)}</p>
              <p className="text-xs text-gray-400 mt-1">{overview.completedOrders} completed</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineTrendingUp className="w-5 h-5 text-green-500" />
                <p className="text-xs text-gray-500 uppercase">Profit</p>
              </div>
              <p className={`text-xl font-bold ${overview.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {fmt(overview.totalProfit)}
              </p>
              <p className="text-xs text-gray-400 mt-1">{overview.avgMargin}% margin</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineShoppingCart className="w-5 h-5 text-purple-500" />
                <p className="text-xs text-gray-500 uppercase">Pending</p>
              </div>
              <p className="text-xl font-bold text-yellow-600">{overview.pendingOrders}</p>
              <p className="text-xs text-gray-400 mt-1">{fmt(overview.pendingAmount)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineTrendingDown className="w-5 h-5 text-red-500" />
                <p className="text-xs text-gray-500 uppercase">Refunded</p>
              </div>
              <p className="text-xl font-bold text-red-600">{fmt(overview.refundedAmount)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
                <p className="text-xs text-gray-500 uppercase">Completed</p>
              </div>
              <p className="text-xl font-bold text-green-600">{fmt(overview.completedProfit)}</p>
            </Card>
          </div>

          {/* Revenue Bar Chart */}
          {daily.length > 0 && (
            <Card className="p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="flex items-end gap-1 h-40 overflow-x-auto">
                {daily.map((d) => {
                  const height = maxDailyRevenue > 0 ? (d.revenue / maxDailyRevenue) * 100 : 0;
                  const profitHeight = maxDailyRevenue > 0 ? (Math.max(d.profit, 0) / maxDailyRevenue) * 100 : 0;
                  return (
                    <div key={d.date} className="flex flex-col items-center flex-shrink-0 min-w-[40px] group relative">
                      <div className="w-full flex flex-col items-center justify-end h-36">
                        <div className="w-6 bg-blue-400 rounded-t" style={{ height: `${Math.max(height, 2)}%` }} />
                        <div className="w-6 bg-green-400 rounded-t -mt-full opacity-80" style={{ height: `${Math.max(profitHeight, 0)}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 truncate w-full text-center">{d.date.slice(5)}</p>
                      <div className="hidden group-hover:block absolute bottom-full mb-1 bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10">
                        <p>{d.date}</p>
                        <p className="text-blue-300">Revenue: {fmt(d.revenue)}</p>
                        <p className="text-green-300">Profit: {fmt(d.profit)}</p>
                        <p>Orders: {d.orders}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded" />Revenue</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded" />Profit</span>
              </div>
            </Card>
          )}

          {/* Hourly + Weekday + Peak */}
          {hourlyData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Peak Times */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineClock className="w-5 h-5 text-primary-500" />
                  Peak Times
                </h3>
                <div className="space-y-3">
                  <div className="bg-primary-50 p-3 rounded-lg">
                    <p className="text-xs text-primary-600 uppercase">Sab se busy ghanta</p>
                    <p className="text-lg font-bold text-primary-900">
                      {hourlyData.peakHour.hour}:00 - {hourlyData.peakHour.hour + 1}:00
                    </p>
                    <p className="text-xs text-primary-600">{hourlyData.peakHour.orders} orders</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 uppercase">Sab se busy din</p>
                    <p className="text-lg font-bold text-green-900">{hourlyData.peakDay.day}</p>
                    <p className="text-xs text-green-600">{hourlyData.peakDay.orders} orders</p>
                  </div>
                </div>
              </Card>

              {/* Hourly Distribution */}
              <Card className="p-5 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4">Ghanta-wise Orders (24 Hours)</h3>
                <div className="flex items-end gap-0.5 h-32">
                  {hourlyData.hourly.map((h) => {
                    const maxH = Math.max(...hourlyData.hourly.map((x) => x.orders), 1);
                    const pct = (h.orders / maxH) * 100;
                    return (
                      <div key={h.hour} className="flex flex-col items-center flex-1 group relative">
                        <div className="w-full flex justify-center">
                          <div
                            className="w-full max-w-[20px] bg-primary-400 hover:bg-primary-600 rounded-t transition-colors"
                            style={{ height: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">{h.hour}</p>
                        <div className="hidden group-hover:block absolute bottom-full mb-1 bg-gray-900 text-white text-xs rounded p-1 whitespace-nowrap z-10">
                          {h.hour}:00 - {h.orders} orders ({fmt(h.revenue)})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Weekday Distribution */}
          {hourlyData && (
            <Card className="p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineCalendar className="w-5 h-5 text-primary-500" />
                Hafta-wise Orders
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {hourlyData.weekday.map((d) => {
                  const maxD = Math.max(...hourlyData.weekday.map((x) => x.orders), 1);
                  const pct = (d.orders / maxD) * 100;
                  const isPeak = d.day === hourlyData.peakDay.day;
                  return (
                    <div key={d.dayIndex} className={`text-center p-3 rounded-lg ${isPeak ? 'bg-primary-100 border-2 border-primary-400' : 'bg-gray-50'}`}>
                      <p className={`text-xs font-medium mb-2 ${isPeak ? 'text-primary-700' : 'text-gray-500'}`}>
                        {d.day.slice(0, 3)}
                      </p>
                      <div className="h-20 flex items-end justify-center">
                        <div
                          className={`w-full max-w-[30px] rounded-t ${isPeak ? 'bg-primary-500' : 'bg-gray-300'}`}
                          style={{ height: `${Math.max(pct, 5)}%` }}
                        />
                      </div>
                      <p className="text-xs font-bold mt-1">{d.orders}</p>
                      <p className="text-[10px] text-gray-400">{fmtShort(d.revenue)}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Status + API vs Manual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
              <div className="space-y-3">
                {overview.statusBreakdown.map((s) => {
                  const total = overview.totalOrders || 1;
                  const pct = ((s.count / total) * 100).toFixed(1);
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            s.status === 'completed' ? 'success' :
                            s.status === 'pending' ? 'warning' :
                            s.status === 'processing' ? 'primary' :
                            s.status === 'cancelled' || s.status === 'refunded' ? 'danger' : 'default'
                          }>
                            {s.status}
                          </Badge>
                          <span className="text-xs text-gray-500">{s.count} ({pct}%)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{fmt(s.amount)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            s.status === 'completed' ? 'bg-green-500' :
                            s.status === 'pending' ? 'bg-yellow-500' :
                            s.status === 'processing' ? 'bg-blue-500' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {providerData && (
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">API vs Manual</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-700">API Orders</span>
                      <span className="text-sm font-bold text-blue-900">{providerData.summary.apiOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">Spending</span>
                      <span className="text-sm font-bold text-blue-900">{fmt(providerData.summary.apiCost)}</span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-700">Manual Orders</span>
                      <span className="text-sm font-bold text-green-900">{providerData.summary.manualOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600">Revenue</span>
                      <span className="text-sm font-bold text-green-900">{fmt(providerData.summary.manualRevenue)}</span>
                    </div>
                  </div>
                  {providerData.providers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Provider Spending</h4>
                      <div className="space-y-2">
                        {providerData.providers.map((p) => (
                          <div key={p.providerId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{p.name}</span>
                            <div className="text-right">
                              <span className="font-medium">{p.orders} orders</span>
                              <span className="text-gray-400 mx-1">|</span>
                              <span className="text-orange-600">{fmt(p.totalCost)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Daily Table */}
          {daily.length > 0 && (
            <Card className="p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Daily Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium text-right">Orders</th>
                      <th className="pb-2 font-medium text-right">Revenue</th>
                      <th className="pb-2 font-medium text-right">Cost</th>
                      <th className="pb-2 font-medium text-right">Profit</th>
                      <th className="pb-2 font-medium text-right">Completed</th>
                      <th className="pb-2 font-medium text-right">Refunded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.map((d) => (
                      <tr key={d.date} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-900">{d.date}</td>
                        <td className="py-2 text-right">{d.orders}</td>
                        <td className="py-2 text-right text-blue-600 font-medium">{fmt(d.revenue)}</td>
                        <td className="py-2 text-right text-orange-600">{fmt(d.cost)}</td>
                        <td className={`py-2 text-right font-medium ${d.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {fmt(d.profit)}
                        </td>
                        <td className="py-2 text-right text-green-600">{d.completed}</td>
                        <td className="py-2 text-right text-red-600">{d.refunded}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold text-gray-900">
                      <td className="py-2">Total</td>
                      <td className="py-2 text-right">{daily.reduce((s, d) => s + d.orders, 0)}</td>
                      <td className="py-2 text-right text-blue-600">{fmt(daily.reduce((s, d) => s + d.revenue, 0))}</td>
                      <td className="py-2 text-right text-orange-600">{fmt(daily.reduce((s, d) => s + d.cost, 0))}</td>
                      <td className={`py-2 text-right ${daily.reduce((s, d) => s + d.profit, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fmt(daily.reduce((s, d) => s + d.profit, 0))}
                      </td>
                      <td className="py-2 text-right text-green-600">{daily.reduce((s, d) => s + d.completed, 0)}</td>
                      <td className="py-2 text-right text-red-600">{daily.reduce((s, d) => s + d.refunded, 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}

          {/* Category + Top Services + Top Users */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Category-wise</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {categories.map((c, i) => {
                  const maxCat = categories[0]?.revenue || 1;
                  const pct = (c.revenue / maxCat) * 100;
                  return (
                    <div key={c.category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 truncate max-w-[120px]" title={c.category}>{c.category}</span>
                        <span className="text-blue-600 font-medium">{fmt(c.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                        <span>{c.orders} orders</span>
                        <span className={c.profit >= 0 ? 'text-green-600' : 'text-red-600'}>Profit: {fmt(c.profit)}</span>
                      </div>
                    </div>
                  );
                })}
                {categories.length === 0 && <p className="text-gray-400 text-center py-4">No data</p>}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Top Services</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {topServices.map((s, i) => (
                  <div key={s.serviceId} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate" title={s.title}>{s.title}</p>
                      <p className="text-xs text-gray-400">{s.category}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-blue-600">{fmt(s.revenue)}</span>
                        <span className={s.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {s.profit >= 0 ? '+' : ''}{fmt(s.profit)}
                        </span>
                        <span className="text-gray-400">{s.orders} orders</span>
                      </div>
                    </div>
                  </div>
                ))}
                {topServices.length === 0 && <p className="text-gray-400 text-center py-4">No data</p>}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineUsers className="w-5 h-5 text-primary-500" />
                Top Customers
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {topUsers.map((u, i) => (
                  <div key={u.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary-600">{fmt(u.totalSpent)}</p>
                      <p className="text-xs text-gray-400">{u.orders} orders</p>
                    </div>
                  </div>
                ))}
                {topUsers.length === 0 && <p className="text-gray-400 text-center py-4">No data</p>}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
