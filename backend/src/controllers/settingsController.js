const Settings = require('../models/Settings');

async function getSettings(req, res) {
  let settings = await Settings.findOne({ singleton: 'main' });
  if (!settings) {
    settings = await Settings.create({ singleton: 'main' });
  }
  res.json({ settings });
}

async function updateSettings(req, res) {
  const settings = await Settings.findOneAndUpdate({ singleton: 'main' }, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  res.json({ settings });
}

module.exports = { getSettings, updateSettings };
