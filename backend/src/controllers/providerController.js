const prisma = require('../lib/prisma');
const config = require('../config');
const ErrorResponse = require('../utils/errorResponse');

// Admin - get all providers (includes env provider)
exports.getProviders = async (req, res, next) => {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { services: true } } },
    });

    // Check if env provider already exists in DB
    const envProviderInDB = providers.find(
      (p) => p.apiUrl === config.smmProvider.url && p.apiKey === config.smmProvider.apiKey
    );

    // Add env provider as virtual entry if not in DB
    const envProvider = {
      id: '__env_default__',
      name: 'Default Provider (env)',
      apiUrl: config.smmProvider.url,
      apiKey: config.smmProvider.apiKey ? config.smmProvider.apiKey.slice(0, 8) + '...' : '***',
      isActive: true,
      isEnvDefault: true,
      services: { count: providers.reduce((acc, p) => acc + (p._count?.services || 0), 0) },
      _count: { services: providers.reduce((acc, p) => acc + (p._count?.services || 0), 0) },
    };

    // Count services that use env provider (providerId is null)
    const servicesWithoutProvider = await prisma.service.count({
      where: { providerId: null },
    });
    envProvider._count = { services: servicesWithoutProvider };

    res.status(200).json({
      success: true,
      count: providers.length + 1,
      data: [envProvider, ...providers],
    });
  } catch (err) {
    next(err);
  }
};

// Admin - get active providers (for dropdown) — includes env provider
exports.getActiveProviders = async (req, res, next) => {
  try {
    const providers = await prisma.provider.findMany({
      where: { isActive: true },
      select: { id: true, name: true, apiUrl: true },
      orderBy: { name: 'asc' },
    });

    // Add env provider as first option
    const envProvider = {
      id: '__env_default__',
      name: 'Default Provider (env)',
      apiUrl: config.smmProvider.url,
    };

    res.status(200).json({ success: true, data: [envProvider, ...providers] });
  } catch (err) {
    next(err);
  }
};

// Admin - create provider
exports.createProvider = async (req, res, next) => {
  try {
    const { name, apiUrl, apiKey, isActive } = req.body;

    if (!name || !apiUrl || !apiKey) {
      return next(new ErrorResponse('Name, API URL and API Key are required', 400));
    }

    const provider = await prisma.provider.create({
      data: {
        name,
        apiUrl,
        apiKey,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
};

// Admin - update provider
exports.updateProvider = async (req, res, next) => {
  try {
    const existing = await prisma.provider.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return next(new ErrorResponse('Provider not found', 404));
    }

    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.status(200).json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
};

// Admin - delete provider
exports.deleteProvider = async (req, res, next) => {
  try {
    const existing = await prisma.provider.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { services: true } } },
    });

    if (!existing) {
      return next(new ErrorResponse('Provider not found', 404));
    }

    if (existing._count.services > 0) {
      return next(new ErrorResponse('Cannot delete provider with existing services. Remove services first or reassign them.', 400));
    }

    await prisma.provider.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// Admin - sync env provider to DB
exports.syncEnvProvider = async (req, res, next) => {
  try {
    const envUrl = config.smmProvider.url;
    const envKey = config.smmProvider.apiKey;

    if (!envUrl || !envKey) {
      return next(new ErrorResponse('No env provider configured', 400));
    }

    // Check if already exists
    const existing = await prisma.provider.findFirst({
      where: { apiUrl: envUrl, apiKey: envKey },
    });

    if (existing) {
      return res.status(200).json({ success: true, message: 'Env provider already in DB', data: existing });
    }

    // Create
    const provider = await prisma.provider.create({
      data: {
        name: 'Default Provider (env)',
        apiUrl: envUrl,
        apiKey: envKey,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, message: 'Env provider synced to DB', data: provider });
  } catch (err) {
    next(err);
  }
};
