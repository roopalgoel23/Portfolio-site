// ponytail self-check: confirms trust proxy correctly unwraps the
// Vercel-rewrite + Render-LB hop chain to the real client IP, instead of
// resolving to Vercel's edge IP (the bug that caused shared 429s in prod).
const assert = require('assert');
const http = require('http');
const express = require('express');

const app = express();
app.set('trust proxy', 2);
app.get('/api/health', (req, res) => res.json({ ip: req.ip }));

const server = app.listen(0, () => {
  const port = server.address().port;
  const options = {
    port,
    path: '/api/health',
    headers: { 'X-Forwarded-For': '203.0.113.7, 198.51.100.9' } // realClient, vercelEdge
  };
  http.get(options, (res) => {
    let body = '';
    res.on('data', (c) => (body += c));
    res.on('end', () => {
      const { ip } = JSON.parse(body);
      assert.strictEqual(ip, '203.0.113.7', `expected real client IP, got ${ip}`);
      console.log('OK: trust proxy resolves real client IP through 2 hops ->', ip);
      server.close();
    });
  });
});
