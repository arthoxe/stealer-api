const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'links.json');
const KEYS_FILE = path.join(__dirname, 'keys.json');

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

  const { privateKey, gofileLink } = req.body;

  if (!privateKey || !gofileLink) {
    return res.status(400).json({ error: 'Missing privateKey or gofileLink' });
  }

  try {
    // Verify the private key exists
    let keys = {};
    if (await fs.pathExists(KEYS_FILE)) {
      keys = await fs.readJson(KEYS_FILE);
    }
    
    if (!keys[privateKey]) {
      return res.status(403).json({ error: 'Invalid private key' });
    }

    // Store the link
    let data = {};
    if (await fs.pathExists(DATA_FILE)) {
      data = await fs.readJson(DATA_FILE);
    }

    if (!data[privateKey]) {
      data[privateKey] = [];
    }
    data[privateKey].push(gofileLink);

    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    console.log(`Link ${gofileLink} added for key ${privateKey}`);

    return res.status(200).json({ message: 'Link saved successfully' });
  } catch (e) {
    console.error(`Error: ${e.stack}`);
    return res.status(500).json({ error: 'Server error, please try again' });
  }
};