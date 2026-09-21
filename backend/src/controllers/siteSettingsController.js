const prisma = require('../lib/prisma');

// Get all settings (public)
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const data = {};
    settings.forEach((s) => { data[s.key] = s.value; });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Admin - update settings
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = req.body; // { key: value, ... }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    res.status(200).json({ success: true, message: 'Settings updated' });
  } catch (err) {
    next(err);
  }
};
