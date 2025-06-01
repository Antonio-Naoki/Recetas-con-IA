const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is working!');
});

const port = 5000;
server.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});