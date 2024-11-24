### **Advanced Topics in Node.js HTTP Module**

Once you're comfortable with the basics of the `http` module, diving into advanced features and techniques can significantly enhance your application's scalability, security, and performance.

---

### **1. Handling Streams in HTTP Requests and Responses**
#### Streaming Large Responses
Instead of sending the entire response at once, use streams for efficient memory usage, especially for large files.

```javascript
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url === '/largefile') {
    const readStream = fs.createReadStream('largefile.txt');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    readStream.pipe(res); // Stream file data directly to the response
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

#### Streaming Request Data
For large payloads sent by the client, you can process data as it arrives using streams.

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
      console.log('Received chunk:', chunk.toString());
    });

    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Data received successfully');
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

---

### **2. Middleware Pattern with Native HTTP Module**
Implement middleware functionality like in frameworks (e.g., Express) by chaining function calls.

```javascript
const http = require('http');

const middleware = [];

function use(fn) {
  middleware.push(fn);
}

function runMiddleware(req, res, done) {
  let index = 0;

  function next() {
    if (index >= middleware.length) {
      return done();
    }
    const fn = middleware[index++];
    fn(req, res, next);
  }

  next();
}

// Add middleware
use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

use((req, res, next) => {
  if (req.url === '/forbidden') {
    res.writeHead(403);
    res.end('Forbidden');
  } else {
    next();
  }
});

// Create server
const server = http.createServer((req, res) => {
  runMiddleware(req, res, () => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, Middleware!');
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

---

### **3. HTTP/2 with the `http2` Module**
HTTP/2 improves performance by enabling multiplexing, header compression, and server push.

#### Basic HTTP/2 Server
```javascript
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
});

server.on('stream', (stream, headers) => {
  stream.respond({
    'content-type': 'text/html',
    ':status': 200,
  });
  stream.end('<h1>Hello, HTTP/2!</h1>');
});

server.listen(3000, () => {
  console.log('HTTP/2 server running at https://localhost:3000/');
});
```

---

#### Server Push with HTTP/2
Server Push allows you to send assets (e.g., CSS, JS) proactively.

```javascript
server.on('stream', (stream, headers) => {
  if (headers[':path'] === '/') {
    stream.respondWithFile('index.html', { 'content-type': 'text/html' });

    stream.pushStream({ ':path': '/style.css' }, (err, pushStream) => {
      if (!err) {
        pushStream.respondWithFile('style.css', { 'content-type': 'text/css' });
      }
    });
  }
});
```

---

### **4. Advanced Caching Techniques**
#### Setting Cache-Control Headers
Use `Cache-Control` headers to control how resources are cached.

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
  });
  res.end('This response is cacheable');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

#### Implementing ETags
ETags help with conditional requests, saving bandwidth by validating cached content.

```javascript
const crypto = require('crypto');

function generateETag(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

const server = http.createServer((req, res) => {
  const data = 'Hello, World!';
  const etag = generateETag(data);

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304); // Not Modified
    res.end();
  } else {
    res.writeHead(200, { 'ETag': etag });
    res.end(data);
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

---

### **5. Load Balancing and Clustering**
For handling high traffic, Node.js supports clustering to utilize multiple CPU cores.

#### Basic Cluster Implementation
```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master process ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello from Node.js Cluster!');
  }).listen(3000);

  console.log(`Worker ${process.pid} started`);
}
```

---

### **6. Secure HTTP Servers**
#### Enforcing HTTPS with Redirects
Redirect HTTP traffic to HTTPS.

```javascript
const http = require('http');
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Secure Server');
}).listen(443);

http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);
```

---

### **7. Rate Limiting**
Prevent abuse by limiting the number of requests per client.

```javascript
const http = require('http');
const rateLimit = new Map();

const server = http.createServer((req, res) => {
  const ip = req.socket.remoteAddress;
  const now = Date.now();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const timestamps = rateLimit.get(ip);
  timestamps.push(now);

  // Remove requests older than 1 minute
  rateLimit.set(ip, timestamps.filter((time) => now - time < 60000));

  if (timestamps.length > 10) {
    res.writeHead(429, { 'Content-Type': 'text/plain' });
    res.end('Too Many Requests');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Request Accepted');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

---

### **8. Debugging and Performance Monitoring**
#### Enabling Debug Logs
Use the `NODE_DEBUG` environment variable.

```bash
NODE_DEBUG=http node server.js
```

#### Monitoring HTTP Traffic
Use tools like **Wireshark**, **Postman**, or built-in modules like `console` to inspect traffic.

---

Would you like a deep dive into any specific topic or implementation? Let me know!