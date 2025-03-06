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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, adminPassword, privateKey, description } = req.body;

  // Verify admin password
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Invalid admin password' });
  }

  try {
    // Initialize or load keys file
    let keys = {};
    if (await fs.pathExists(KEYS_FILE)) {
      keys = await fs.readJson(KEYS_FILE);
    }

    // Handle different actions
    if (action === 'add') {
      if (!privateKey) {
        return res.status(400).json({ error: 'Missing privateKey' });
      }
      
      keys[privateKey] = {
        description: description || `Key created on ${new Date().toISOString()}`,
        createdAt: new Date().toISOString()
      };
      
      await fs.writeJson(KEYS_FILE, keys, { spaces: 2 });
      return res.status(200).json({ message: 'Private key added successfully' });
    } 
    else if (action === 'list') {
      return res.status(200).json({ keys });
    }
    else if (action === 'delete') {
      if (!privateKey || !keys[privateKey]) {
        return res.status(400).json({ error: 'Invalid privateKey' });
      }
      
      delete keys[privateKey];
      await fs.writeJson(KEYS_FILE, keys, { spaces: 2 });
      return res.status(200).json({ message: 'Private key deleted successfully' });
    }
    else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (e) {
    console.error(`Error: ${e.stack}`);
    return res.status(500).json({ error: 'Server error, please try again' });
  }
};