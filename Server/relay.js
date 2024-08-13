const express = require('express');
const serverless = require('serverless-http');
const app = express();
const crypto = require('crypto');

// TODO: Adjust the request size limit if needed
app.use(express.json({ limit: '50mb' }));

// In-memory storage for share connections
// TODO: For production, consider using a more robust storage solution
let shareConnections = {};

// TODO: Adjust the expiration time for shares as needed
const SHARE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

app.get('/.netlify/functions/relay', (req, res) => {
  res.json({ message: "WebRTC relay server is working" });
});

app.post('/.netlify/functions/relay/create-share', (req, res) => {
  const { metadata } = req.body;
  const shareId = crypto.randomBytes(8).toString('hex');

  shareConnections[shareId] = {
    metadata,
    pendingConnections: [],
    activeConnections: [],
    createdAt: Date.now()
  };

  // TODO: Replace 'your-site-name' with a placeholder or environment variable
  res.json({ shareId, link: `https://your-site-name.netlify.app/download/${shareId}` });
});

app.post('/.netlify/functions/relay/add-offer/:shareId', (req, res) => {
  const { shareId } = req.params;
  const { offer } = req.body;
  
  if (shareConnections[shareId]) {
    const connectionId = crypto.randomBytes(8).toString('hex');
    shareConnections[shareId].pendingConnections.push({ connectionId, offer });
    res.json({ connectionId });
  } else {
    res.status(404).json({ error: "Share not found" });
  }
});

app.get('/.netlify/functions/relay/get-metadata/:shareId', (req, res) => {
  const { shareId } = req.params;
  
  if (shareConnections[shareId]) {
    res.json({ metadata: shareConnections[shareId].metadata });
  } else {
    res.status(404).json({ error: "Share not found" });
  }
});

app.get('/.netlify/functions/relay/get-offer/:shareId', (req, res) => {
  const { shareId } = req.params;
  
  if (shareConnections[shareId] && shareConnections[shareId].pendingConnections.length > 0) {
    const connection = shareConnections[shareId].pendingConnections.shift();
    shareConnections[shareId].activeConnections.push(connection);
    res.json({ connectionId: connection.connectionId, offer: connection.offer });
  } else {
    res.status(404).json({ error: "No pending connections available" });
  }
});

app.post('/.netlify/functions/relay/set-answer/:shareId/:connectionId', (req, res) => {
  const { shareId, connectionId } = req.params;
  const { answer } = req.body;
  
  if (shareConnections[shareId]) {
    const connection = shareConnections[shareId].activeConnections.find(conn => conn.connectionId === connectionId);
    if (connection) {
      connection.answer = answer;
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Connection not found" });
    }
  } else {
    res.status(404).json({ error: "Share not found" });
  }
});

app.get('/.netlify/functions/relay/get-answer/:shareId/:connectionId', (req, res) => {
  const { shareId, connectionId } = req.params;
  
  if (shareConnections[shareId]) {
    const connection = shareConnections[shareId].activeConnections.find(conn => conn.connectionId === connectionId);
    if (connection && connection.answer) {
      res.json({ answer: connection.answer });
    } else {
      res.status(404).json({ error: "Answer not found" });
    }
  } else {
    res.status(404).json({ error: "Share not found" });
  }
});

app.post('/.netlify/functions/relay/remove-connection/:shareId/:connectionId', (req, res) => {
  const { shareId, connectionId } = req.params;
  
  if (shareConnections[shareId]) {
    shareConnections[shareId].activeConnections = shareConnections[shareId].activeConnections.filter(conn => conn.connectionId !== connectionId);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Share not found" });
  }
});

// Clean up expired shares
setInterval(() => {
  const now = Date.now();
  Object.keys(shareConnections).forEach(shareId => {
    if (now - shareConnections[shareId].createdAt > SHARE_EXPIRATION_TIME) {
      delete shareConnections[shareId];
    }
  });
}, 60 * 60 * 1000); // Run every hour

const handler = serverless(app);
module.exports.handler = handler;