const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');

exports.getPaymentMethods = async (req, res, next) => {
  try {
    const where = req.user?.role === 'admin' ? {} : { isActive: true };

    const methods = await prisma.paymentMethod.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: methods.length,
      data: methods,
    });
  } catch (err) {
    next(err);
  }
};

exports.createPaymentMethod = async (req, res, next) => {
  try {
    const { name, accountNumber, accountTitle, logo, minAmount, maxAmount, fee, isActive, instructions } = req.body;

    if (!name || !accountNumber || !accountTitle) {
      return next(new ErrorResponse('Name, account number and account title are required', 400));
    }

    const method = await prisma.paymentMethod.create({
      data: {
        name,
        accountNumber,
        accountTitle,
        logo: logo || null,
        minAmount: minAmount || 50,
        maxAmount: maxAmount || 10000,
        fee: fee || 0,
        isActive: isActive !== undefined ? isActive : true,
        instructions: instructions || null,
      },
    });

    res.status(201).json({ success: true, data: method });
  } catch (err) {
    next(err);
  }
};

exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const existing = await prisma.paymentMethod.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return next(new ErrorResponse('Payment method not found', 404));
    }

    const { name, accountNumber, accountTitle, logo, minAmount, maxAmount, fee, isActive, instructions } = req.body;

    const method = await prisma.paymentMethod.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        accountNumber: accountNumber !== undefined ? accountNumber : existing.accountNumber,
        accountTitle: accountTitle !== undefined ? accountTitle : existing.accountTitle,
        logo: logo !== undefined ? logo : existing.logo,
        minAmount: minAmount !== undefined ? minAmount : existing.minAmount,
        maxAmount: maxAmount !== undefined ? maxAmount : existing.maxAmount,
        fee: fee !== undefined ? fee : existing.fee,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        instructions: instructions !== undefined ? instructions : existing.instructions,
      },
    });

    res.status(200).json({ success: true, data: method });
  } catch (err) {
    next(err);
  }
};

exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const existing = await prisma.paymentMethod.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return next(new ErrorResponse('Payment method not found', 404));
    }

    await prisma.paymentMethod.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
