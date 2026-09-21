const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');

// Admin - get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { services: true } } },
    });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

// Admin - create category
exports.createCategory = async (req, res, next) => {
  try {
    const { name, displayName, sortOrder, isActive } = req.body;

    if (!name || !name.trim()) {
      return next(new ErrorResponse('Category name is required', 400));
    }

    const existing = await prisma.category.findFirst({
      where: { name: name.trim() },
    });
    if (existing) {
      return next(new ErrorResponse('Category already exists', 400));
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        displayName: displayName?.trim() || null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 9999,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// Admin - update category
exports.updateCategory = async (req, res, next) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return next(new ErrorResponse('Category not found', 404));
    }

    // Check duplicate name if changing
    if (req.body.name && req.body.name.trim() !== existing.name) {
      const duplicate = await prisma.category.findFirst({
        where: { name: req.body.name.trim(), id: { not: req.params.id } },
      });
      if (duplicate) {
        return next(new ErrorResponse('Category name already exists', 400));
      }
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name?.trim() || existing.name,
        displayName: req.body.displayName?.trim() || existing.displayName,
        sortOrder: req.body.sortOrder !== undefined ? parseInt(req.body.sortOrder) : existing.sortOrder,
        isActive: req.body.isActive !== undefined ? req.body.isActive : existing.isActive,
      },
    });

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// Admin - delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { services: true } } },
    });

    if (!existing) {
      return next(new ErrorResponse('Category not found', 404));
    }

    if (existing._count.services > 0) {
      return next(new ErrorResponse(
        `Cannot delete category with ${existing._count.services} services. Unassign or delete services first.`,
        400
      ));
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// Admin - bulk update sort orders
exports.reorderCategories = async (req, res, next) => {
  try {
    const { order } = req.body; // [{ id, sortOrder }, ...]
    if (!Array.isArray(order)) {
      return next(new ErrorResponse('Order array is required', 400));
    }

    for (const item of order) {
      await prisma.category.update({
        where: { id: item.id },
        data: { sortOrder: parseInt(item.sortOrder) },
      });
    }

    res.status(200).json({ success: true, message: 'Categories reordered' });
  } catch (err) {
    next(err);
  }
};

// Admin - sync categories from existing services
exports.syncFromServices = async (req, res, next) => {
  try {
    // Get all unique category strings from services
    const result = await prisma.$queryRaw`SELECT DISTINCT category FROM services WHERE category IS NOT NULL AND category != ''`;

    const uniqueCategories = result.map((r) => r.category);

    let created = 0;
    let skipped = 0;

    for (const catName of uniqueCategories) {
      const existing = await prisma.category.findFirst({ where: { name: catName } });
      if (existing) {
        skipped++;
        continue;
      }

      await prisma.category.create({
        data: { name: catName, sortOrder: created },
      });
      created++;
    }

    res.status(200).json({
      success: true,
      message: `Synced: ${created} created, ${skipped} already existed`,
      data: { created, skipped, total: uniqueCategories.length },
    });
  } catch (err) {
    next(err);
  }
};
