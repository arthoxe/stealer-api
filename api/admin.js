const fs = require('fs-extra');
const path = require('path');

const KEYS_FILE = path.join(__dirname, 'keys.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change_this_password';

module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Simple response for debugging
  return res.status(200).json({ message: 'Admin API is working' });
};