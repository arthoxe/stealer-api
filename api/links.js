const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'links.json');
const KEYS_FILE = path.join(__dirname, 'keys.json');

module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: 'Missing key parameter' });
  }

  try {
    // Check if key exists in the keys file
    let keys = {};
    if (await fs.pathExists(KEYS_FILE)) {
      keys = await fs.readJson(KEYS_FILE);
    }
    
    if (!keys[key]) {
      return res.status(403).json({ error: 'Invalid private key' });
    }

    // If key is valid, return associated links
    let data = {};
    if (await fs.pathExists(DATA_FILE)) {
      data = await fs.readJson(DATA_FILE);
    }

    const links = data[key] || [];
    const keyInfo = keys[key];
    
    return res.status(200).json({ 
      links,
      keyInfo
    });
  } catch (e) {
    console.error(`Error: ${e.stack}`);
    return res.status(500).json({ error: 'Server error, please try again' });
  }
};