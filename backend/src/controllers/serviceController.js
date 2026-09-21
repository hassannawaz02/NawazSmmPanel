const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');
const SMMProvider = require('../services/smmProvider');

exports.getServices = async (req, res, next) => {
  try {
    const { category, search, status } = req.query;
    const where = {};

    if (req.user && req.user.role === 'admin' && status !== undefined && status !== 'all') {
      where.isActive = status === 'active';
    } else if (!req.user || req.user.role !== 'admin') {
      where.isActive = true;
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ categorySortOrder: 'asc' }, { sortOrder: 'asc' }, { title: 'asc' }],
    });

    const groupedServices = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
      grouped: groupedServices,
    });
  } catch (err) {
    next(err);
  }
};

exports.getService = async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }

    if (!service.isActive && (!req.user || req.user.role !== 'admin')) {
      return next(new ErrorResponse('Service not found', 404));
    }

    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const service = await prisma.service.create({ data: req.body });
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const existing = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return next(new ErrorResponse('Service not found', 404));
    }

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }

    await prisma.service.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.bulkDeleteServices = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorResponse('Please provide service IDs to delete', 400));
    }

    const result = await prisma.service.deleteMany({
      where: { id: { in: ids } },
    });

    res.status(200).json({ success: true, data: { deleted: result.count } });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const result = await prisma.service.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true },
    });

    const categories = result.map((r) => r.category);

    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.checkSortOrder = async (req, res, next) => {
  try {
    const { sortOrder, categorySortOrder, excludeId } = req.query;

    const where = {};
    if (sortOrder !== undefined) {
      where.sortOrder = parseInt(sortOrder);
    }
    if (categorySortOrder !== undefined) {
      where.categorySortOrder = parseInt(categorySortOrder);
    }
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await prisma.service.findFirst({
      where,
      select: { id: true, title: true, sortOrder: true, categorySortOrder: true, category: true },
    });

    if (existing) {
      const nextSortOrder = await prisma.service.findFirst({
        where: { sortOrder: { not: parseInt(sortOrder) } },
        orderBy: { sortOrder: 'asc' },
        select: { sortOrder: true },
      });
      const allSortOrders = await prisma.service.findMany({
        where: { sortOrder: { not: 0 } },
        select: { sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      });
      const usedOrders = allSortOrders.map((s) => s.sortOrder);
      let nextAvailable = 1;
      while (usedOrders.includes(nextAvailable)) nextAvailable++;

      return res.status(200).json({
        success: true,
        data: {
          duplicate: true,
          existing,
          nextAvailable,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { duplicate: false },
    });
  } catch (err) {
    next(err);
  }
};

exports.syncFromProvider = async (req, res, next) => {
  try {
    const { providerId } = req.body;

    let smmClient;
    let providerName = 'Default';

    if (providerId && providerId !== '__env_default__') {
      const provider = await prisma.provider.findUnique({ where: { id: providerId } });
      if (!provider) {
        return next(new ErrorResponse('Provider not found', 404));
      }
      smmClient = SMMProvider.fromDB(provider);
      providerName = provider.name;
    } else {
      smmClient = SMMProvider.getDefault();
      providerName = 'Default (env)';
    }

    const providerServices = await smmClient.getServices();

    if (!Array.isArray(providerServices)) {
      return next(new ErrorResponse('Invalid response from provider', 500));
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const ps of providerServices) {
      try {
        const serviceId = ps.service?.toString();
        if (!serviceId) {
          skipped++;
          continue;
        }

        const existing = await prisma.service.findFirst({
          where: { providerServiceId: serviceId },
        });

        const rawMin = parseInt(ps.min) || 1;
        const rawMax = parseInt(ps.max) || 1000;
        const MAX_INT = 2147483647;
        const providerCost = parseFloat(ps.rate) || 0;

        if (existing) {
          await prisma.service.update({
            where: { id: existing.id },
            data: {
              providerRate: providerCost,
            },
          });
          updated++;
        } else {
          const data = {
            title: ps.name || `Service ${serviceId}`,
            category: ps.category || 'Uncategorized',
            description: ps.type || '',
            rate: providerCost,
            providerRate: providerCost,
            min: Math.min(rawMin, MAX_INT),
            max: Math.min(rawMax, MAX_INT),
            providerServiceId: serviceId,
            isActive: true,
          };
          await prisma.service.create({ data });
          created++;
        }
      } catch (err) {
        skipped++;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        total: providerServices.length,
        created,
        updated,
        skipped,
      },
    });
  } catch (err) {
    next(err);
  }
};
