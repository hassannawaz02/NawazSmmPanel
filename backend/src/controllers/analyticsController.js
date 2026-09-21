const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');

function getDateRange(period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '15d':
      startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '3m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case '1y':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case 'all':
    default:
      startDate = new Date(2020, 0, 1);
      break;
  }

  return { startDate, endDate: now };
}

exports.getFinancialOverview = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const where = {
      createdAt: { gte: startDate, lte: endDate },
    };

    const [orders, statusGroups] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          service: { select: { id: true, title: true, category: true, rate: true, providerRate: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { amount: true, providerCost: true, profit: true },
      }),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalCost = orders.reduce((sum, o) => sum + (o.providerCost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    const completedOrders = orders.filter((o) => o.status === 'completed');
    const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const completedCost = completedOrders.reduce((sum, o) => sum + (o.providerCost || 0), 0);
    const completedProfit = completedRevenue - completedCost;

    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing' || o.status === 'in_progress');
    const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const pendingCost = pendingOrders.reduce((sum, o) => sum + (o.providerCost || 0), 0);

    const refundedAmount = orders
      .filter((o) => o.status === 'refunded' || o.status === 'cancelled')
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const statusBreakdown = statusGroups.map((s) => ({
      status: s.status,
      count: s._count.id,
      amount: s._sum.amount || 0,
      cost: s._sum.providerCost || 0,
      profit: s._sum.profit || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        period,
        totalOrders,
        totalRevenue,
        totalCost,
        totalProfit,
        avgMargin: parseFloat(avgMargin),
        completedOrders: completedOrders.length,
        completedRevenue,
        completedCost,
        completedProfit,
        pendingOrders: pendingOrders.length,
        pendingAmount,
        pendingCost,
        refundedAmount,
        statusBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getDailyBreakdown = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        amount: true,
        providerCost: true,
        profit: true,
        status: true,
        createdAt: true,
      },
    });

    const dailyMap = {};
    orders.forEach((o) => {
      const date = o.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[date]) {
        dailyMap[date] = { date, orders: 0, revenue: 0, cost: 0, profit: 0, completed: 0, refunded: 0 };
      }
      dailyMap[date].orders++;
      dailyMap[date].revenue += o.amount || 0;
      dailyMap[date].cost += o.providerCost || 0;
      dailyMap[date].profit += (o.amount || 0) - (o.providerCost || 0);
      if (o.status === 'completed') dailyMap[date].completed++;
      if (o.status === 'refunded' || o.status === 'cancelled') dailyMap[date].refunded++;
    });

    const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({ success: true, data: daily });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        service: { isNot: null },
      },
      include: {
        service: { select: { category: true, title: true } },
      },
    });

    const categoryMap = {};
    orders.forEach((o) => {
      const cat = o.service?.category || 'Unknown';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, orders: 0, revenue: 0, cost: 0, profit: 0 };
      }
      categoryMap[cat].orders++;
      categoryMap[cat].revenue += o.amount || 0;
      categoryMap[cat].cost += o.providerCost || 0;
      categoryMap[cat].profit += (o.amount || 0) - (o.providerCost || 0);
    });

    const categories = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.getServiceBreakdown = async (req, res, next) => {
  try {
    const { period = 'all', limit = 20 } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        service: { isNot: null },
      },
      include: {
        service: { select: { id: true, title: true, category: true, rate: true, providerRate: true } },
      },
    });

    const serviceMap = {};
    orders.forEach((o) => {
      const sid = o.serviceId || 'unknown';
      const sTitle = o.service?.title || 'Unknown Service';
      const sCat = o.service?.category || 'Unknown';
      if (!serviceMap[sid]) {
        serviceMap[sid] = {
          serviceId: sid,
          title: sTitle,
          category: sCat,
          orders: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        };
      }
      serviceMap[sid].orders++;
      serviceMap[sid].revenue += o.amount || 0;
      serviceMap[sid].cost += o.providerCost || 0;
      serviceMap[sid].profit += (o.amount || 0) - (o.providerCost || 0);
    });

    const services = Object.values(serviceMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit));

    res.status(200).json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

exports.getProviderSpending = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        providerOrderId: { not: null },
      },
      include: {
        service: {
          select: {
            providerId: true,
            providerServiceId: true,
          },
        },
      },
    });

    const providers = await prisma.provider.findMany({
      select: { id: true, name: true },
    });

    const providerMap = {};
    providers.forEach((p) => {
      providerMap[p.id] = {
        providerId: p.id,
        name: p.name,
        orders: 0,
        totalCost: 0,
        totalRevenue: 0,
      };
    });

    let apiOrders = 0;
    let apiCost = 0;
    let manualOrders = 0;
    let manualRevenue = 0;

    orders.forEach((o) => {
      const pid = o.service?.providerId;
      if (pid && providerMap[pid]) {
        providerMap[pid].orders++;
        providerMap[pid].totalCost += o.providerCost || 0;
        providerMap[pid].totalRevenue += o.amount || 0;
      }
    });

    const allOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { service: { select: { isManual: true } } },
    });

    allOrders.forEach((o) => {
      if (o.service?.isManual) {
        manualOrders++;
        manualRevenue += o.amount || 0;
      } else if (o.providerOrderId) {
        apiOrders++;
        apiCost += o.providerCost || 0;
      }
    });

    const providerSpending = Object.values(providerMap).filter((p) => p.orders > 0);

    res.status(200).json({
      success: true,
      data: {
        providers: providerSpending,
        summary: {
          apiOrders,
          apiCost,
          manualOrders,
          manualRevenue,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getGrowthComparison = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const { startDate: currStart, endDate: currEnd } = getDateRange(period);

    const periodMs = currEnd.getTime() - currStart.getTime();
    const prevStart = new Date(currStart.getTime() - periodMs);
    const prevEnd = new Date(currStart.getTime());

    const [currOrders, prevOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: currStart, lte: currEnd } },
        select: { amount: true, providerCost: true, profit: true, status: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: prevStart, lte: prevEnd } },
        select: { amount: true, providerCost: true, profit: true, status: true },
      }),
    ]);

    const calcStats = (orders) => {
      const total = orders.length;
      const revenue = orders.reduce((s, o) => s + (o.amount || 0), 0);
      const cost = orders.reduce((s, o) => s + (o.providerCost || 0), 0);
      const profit = revenue - cost;
      const completed = orders.filter((o) => o.status === 'completed').length;
      const refundRate = total > 0 ? ((orders.filter((o) => o.status === 'refunded' || o.status === 'cancelled').length / total) * 100).toFixed(1) : 0;
      const avgOrder = total > 0 ? revenue / total : 0;
      return { total, revenue, cost, profit, completed, refundRate: parseFloat(refundRate), avgOrder };
    };

    const curr = calcStats(currOrders);
    const prev = calcStats(prevOrders);

    const growth = (currVal, prevVal) => {
      if (prevVal === 0) return currVal > 0 ? 100 : 0;
      return parseFloat(((currVal - prevVal) / prevVal * 100).toFixed(1));
    };

    res.status(200).json({
      success: true,
      data: {
        current: curr,
        previous: prev,
        growth: {
          orders: growth(curr.total, prev.total),
          revenue: growth(curr.revenue, prev.revenue),
          cost: growth(curr.cost, prev.cost),
          profit: growth(curr.profit, prev.profit),
          avgOrder: growth(curr.avgOrder, prev.avgOrder),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getHourlyAndWeekday = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { amount: true, createdAt: true },
    });

    const hourlyMap = Array(24).fill(null).map((_, i) => ({ hour: i, orders: 0, revenue: 0 }));
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayMap = weekdayNames.map((name, i) => ({ day: name, dayIndex: i, orders: 0, revenue: 0 }));

    orders.forEach((o) => {
      const h = o.createdAt.getHours();
      const d = o.createdAt.getDay();
      hourlyMap[h].orders++;
      hourlyMap[h].revenue += o.amount || 0;
      weekdayMap[d].orders++;
      weekdayMap[d].revenue += o.amount || 0;
    });

    const peakHour = hourlyMap.reduce((max, h) => h.orders > max.orders ? h : max, hourlyMap[0]);
    const peakDay = weekdayMap.reduce((max, d) => d.orders > max.orders ? d : max, weekdayMap[0]);

    res.status(200).json({
      success: true,
      data: {
        hourly: hourlyMap,
        weekday: weekdayMap,
        peakHour: { hour: peakHour.hour, orders: peakHour.orders },
        peakDay: { day: peakDay.day, orders: peakDay.orders },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTopUsers = async (req, res, next) => {
  try {
    const { period = 'all', limit = 10 } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: {
        user: { select: { id: true, name: true, username: true, email: true } },
      },
    });

    const userMap = {};
    orders.forEach((o) => {
      const uid = o.userId;
      if (!userMap[uid]) {
        userMap[uid] = {
          userId: uid,
          name: o.user?.name || 'Unknown',
          username: o.user?.username || '',
          orders: 0,
          totalSpent: 0,
        };
      }
      userMap[uid].orders++;
      userMap[uid].totalSpent += o.amount || 0;
    });

    const topUsers = Object.values(userMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, parseInt(limit));

    res.status(200).json({ success: true, data: topUsers });
  } catch (err) {
    next(err);
  }
};
