const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function signToken(admin) {
  return jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  const admin = await Admin.findOne({ username: username.trim().toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  const match = await admin.comparePassword(password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  const token = signToken(admin);
  res.json({ token, admin: admin.toSafeObject() });
}

async function me(req, res) {
  res.json({ admin: req.admin.toSafeObject() });
}

module.exports = { login, me };
