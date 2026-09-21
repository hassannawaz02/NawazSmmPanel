const cron = require('node-cron');
const prisma = require('../lib/prisma');
const SMMProvider = require('../services/smmProvider');

const BATCH_SIZE = 100;
const smmProvider = SMMProvider.getDefault();

function mapProviderStatus(providerStatus) {
  switch (providerStatus?.toLowerCase()) {
    case 'pending':
      return 'pending';
    case 'processing':
    case 'in progress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'partial':
      return 'partial';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'refunded':
      return 'refunded';
    case 'expired':
      return 'cancelled';
    case 'error':
    case 'failed':
      return 'cancelled';
    default:
      return null;
  }
}

const orderStatusCron = cron.schedule(
  '*/5 * * * *',
  async () => {
    console.log('Running order status check cron job...');

    try {
      const orders = await prisma.order.findMany({
        where: {
          status: { in: ['pending', 'processing', 'in_progress'] },
          providerOrderId: { not: null },
        },
        take: 500,
      });

      if (orders.length === 0) {
        console.log('No orders to check');
        return;
      }

      console.log(`Checking ${orders.length} orders...`);

      const providerOrderIds = orders.map((o) => o.providerOrderId);
      const orderMap = {};
      orders.forEach((o) => {
        orderMap[o.providerOrderId] = o;
      });

      for (let i = 0; i < providerOrderIds.length; i += BATCH_SIZE) {
        const batch = providerOrderIds.slice(i, i + BATCH_SIZE);

        try {
          let statusMap = {};
          if (batch.length === 1) {
            const status = await smmProvider.checkOrderStatus(batch[0]);
            statusMap[batch[0]] = status;
          } else {
            const statuses = await smmProvider.checkMultipleOrderStatus(batch);
            if (Array.isArray(statuses)) {
              statuses.forEach((s) => {
                if (s.order) {
                  statusMap[s.order.toString()] = s;
                }
              });
            }
          }

          for (const providerOrderId of batch) {
            const statusData = statusMap[providerOrderId];
            if (!statusData) continue;

            const order = orderMap[providerOrderId];
            if (!order) continue;

            try {
              const newStatus = mapProviderStatus(statusData.status);
              if (!newStatus || newStatus === order.status) continue;

              const updateData = { status: newStatus };
              if (statusData.start_count !== undefined) {
                updateData.startCount = parseInt(statusData.start_count) || 0;
              }
              if (statusData.remains !== undefined) {
                updateData.remains = parseInt(statusData.remains) || 0;
              }

              await prisma.order.update({
                where: { id: order.id },
                data: updateData,
              });

              if (
                (newStatus === 'partial' || newStatus === 'cancelled') &&
                (statusData.remains || 0) > 0
              ) {
                const existingRefund = await prisma.walletTransaction.findFirst({
                  where: { orderId: order.id, type: 'credit', paymentMethod: 'refund' },
                });

                if (!existingRefund) {
                  const orderWithService = await prisma.order.findUnique({
                    where: { id: order.id },
                    include: { service: true },
                  });

                  if (orderWithService.service) {
                    const refundAmount =
                      (orderWithService.service.rate / 1000) *
                      orderWithService.remains;

                    if (refundAmount > 0) {
                      const user = await prisma.user.findUnique({
                        where: { id: order.userId },
                      });
                      const newBalance = user.walletBalance + refundAmount;

                      await prisma.user.update({
                        where: { id: user.id },
                        data: { walletBalance: newBalance },
                      });

                      await prisma.walletTransaction.create({
                        data: {
                          userId: user.id,
                          type: 'credit',
                          amount: refundAmount,
                          description: `Refund for order #${order.orderNumber}`,
                          balanceAfter: newBalance,
                          paymentMethod: 'refund',
                          orderId: order.id,
                          status: 'completed',
                        },
                      });
                    }
                  }
                }
              }

              console.log(`Order #${order.orderNumber} → ${newStatus}`);
            } catch (err) {
              console.error(
                `Error updating order #${order.orderNumber}:`,
                err.message
              );
            }
          }
        } catch (batchError) {
          console.error('Batch status check error:', batchError.message);
        }
      }

      console.log('Order status check completed');
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  },
  { scheduled: false }
);

const retryFailedOrdersCron = cron.schedule(
  '*/10 * * * *',
  async () => {
    console.log('Running retry failed orders cron job...');

    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const orders = await prisma.order.findMany({
        where: {
          status: 'pending',
          providerOrderId: null,
          createdAt: { gte: twentyFourHoursAgo },
          service: { isManual: false },
        },
        include: { service: true },
        take: 50,
      });

      if (orders.length === 0) {
        console.log('No failed orders to retry');
        return;
      }

      console.log(`Retrying ${orders.length} failed orders...`);

      for (const order of orders) {
        try {
          const response = await smmProvider.createOrder(
            order.service.providerServiceId,
            order.link,
            order.quantity
          );

          if (response && response.order) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                providerOrderId: response.order.toString(),
                status: 'processing',
              },
            });
            console.log(`Order #${order.orderNumber} successfully sent to provider`);
          }
        } catch (err) {
          console.error(`Error retrying order #${order.orderNumber}:`, err.message);
        }
      }

      console.log('Retry failed orders completed');
    } catch (err) {
      console.error('Retry cron job error:', err.message);
    }
  },
  { scheduled: false }
);

const startCronJobs = () => {
  orderStatusCron.start();
  retryFailedOrdersCron.start();
  console.log('Cron jobs started');
};

const stopCronJobs = () => {
  orderStatusCron.stop();
  retryFailedOrdersCron.stop();
  console.log('Cron jobs stopped');
};

module.exports = { startCronJobs, stopCronJobs };
