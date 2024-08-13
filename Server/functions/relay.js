const express = require('express');
const serverless = require('serverless-http');
const app = express();
const crypto = require('crypto');

app.use(express.json({ limit: '50mb' }));

let shareConnections = {};

app.get('/.netlify/functions/relay', (req, res) => {
  res.json({ message: "WebRTC relay server is working" });
});

app.post('/.netlify/functions/relay/create-share', (req, res) => {
  const { metadata } = req.body;
  const shareId = crypto.randomBytes(8).toString('hex');

  shareConnections[shareId] = {
    metadata,
    pendingConnections: [],
    activeConnections: []
  };

  res.json({ shareId, link: `https://${req.headers.host}/download/${shareId}` });
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

const handler = serverless(app);
module.exports.handler = handler;