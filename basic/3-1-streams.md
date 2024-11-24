### **Advanced Topics in Node.js Streams**

Streams are integral to high-performance applications, and mastering advanced techniques can enhance how you handle data. Let’s explore some advanced stream concepts, implementations, and optimization strategies.

---

### **1. Advanced Stream Types**
#### Multi-Stage Pipelines
You can chain multiple streams to create a complex processing pipeline.

```javascript
const fs = require('fs');
const zlib = require('zlib');

fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('output.txt.gz'))
  .on('finish', () => console.log('File successfully compressed!'));
```

---

#### PassThrough Streams
A `PassThrough` stream is a simple type of duplex stream that acts as a no-op. It is useful for debugging or measuring data flow.

```javascript
const { PassThrough } = require('stream');
const fs = require('fs');

const passThrough = new PassThrough();

passThrough.on('data', (chunk) => {
  console.log('Chunk size:', chunk.length);
});

fs.createReadStream('input.txt')
  .pipe(passThrough)
  .pipe(fs.createWriteStream('output.txt'));
```

---

### **2. Stream Error Handling**
#### Using the `pipeline` Utility
`stream.pipeline` simplifies error handling in complex pipelines by ensuring proper cleanup.

```javascript
const { pipeline } = require('stream');
const fs = require('fs');
const zlib = require('zlib');

pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);
```

---

#### Capturing Errors for Individual Streams
Each stream can emit its own `error` event. Always handle these to prevent crashes.

```javascript
const fs = require('fs');

const readStream = fs.createReadStream('nonexistent.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.on('error', (err) => {
  console.error('Read stream error:', err.message);
});

writeStream.on('error', (err) => {
  console.error('Write stream error:', err.message);
});
```

---

### **3. Stream Backpressure Management**
Backpressure occurs when a writable stream cannot handle the data as fast as the readable stream produces it. Managing backpressure ensures optimal performance and prevents memory issues.

#### Example with Manual Handling:
```javascript
const fs = require('fs');

const readStream = fs.createReadStream('largefile.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.on('data', (chunk) => {
  if (!writeStream.write(chunk)) {
    readStream.pause(); // Pause if the buffer is full
  }
});

writeStream.on('drain', () => {
  readStream.resume(); // Resume when writable stream is ready
});
```

#### Using `pipeline` to Handle Backpressure:
```javascript
const { pipeline } = require('stream');
const fs = require('fs');

pipeline(
  fs.createReadStream('largefile.txt'),
  fs.createWriteStream('output.txt'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);
```

---

### **4. Custom Streams**
#### Creating Custom Writable Streams
Custom writable streams allow you to control how data is written.

```javascript
const { Writable } = require('stream');

class CustomWritable extends Writable {
  _write(chunk, encoding, callback) {
    console.log('Writing:', chunk.toString());
    callback();
  }
}

const customWritable = new CustomWritable();
customWritable.write('Hello, ');
customWritable.write('Streams!');
customWritable.end();
```

#### Creating Custom Transform Streams
Transform streams modify the data as it passes through.

```javascript
const { Transform } = require('stream');

class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

process.stdin.pipe(new UpperCaseTransform()).pipe(process.stdout);
```

---

### **5. Stream Performance Optimization**
#### Adjusting `highWaterMark`
The `highWaterMark` option controls the internal buffer size of a stream. For large data, increasing this value can improve performance.

```javascript
const readStream = fs.createReadStream('input.txt', { highWaterMark: 64 * 1024 }); // 64KB buffer
```

#### Using `objectMode`
Streams can handle non-buffer data like objects with `objectMode`.

```javascript
const { Transform } = require('stream');

class JSONTransform extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk, encoding, callback) {
    this.push(JSON.stringify(chunk));
    callback();
  }
}

const jsonTransform = new JSONTransform();
jsonTransform.write({ key: 'value' });
jsonTransform.end();
```

---

### **6. Stream Utilities**
#### Combining Multiple Streams with `stream.compose`
`stream.compose` merges streams in a pipeline.

```javascript
const { compose } = require('stream');
const { Transform } = require('stream');

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});

const reverse = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().split('').reverse().join(''));
    callback();
  },
});

const composed = compose(upperCase, reverse);
process.stdin.pipe(composed).pipe(process.stdout);
```

#### Using `stream.finished`
`finished` is useful for detecting when a stream ends or encounters an error.

```javascript
const { finished } = require('stream');
const fs = require('fs');

const readStream = fs.createReadStream('input.txt');

finished(readStream, (err) => {
  if (err) {
    console.error('Stream failed:', err);
  } else {
    console.log('Stream finished successfully');
  }
});
```

---

### **7. Parallel Processing with Streams**
Split data processing into multiple streams for parallelism.

#### Example:
```javascript
const { Transform, pipeline } = require('stream');

class Splitter extends Transform {
  constructor(splitSize) {
    super();
    this.buffer = '';
    this.splitSize = splitSize;
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    while (this.buffer.length >= this.splitSize) {
      this.push(this.buffer.slice(0, this.splitSize));
      this.buffer = this.buffer.slice(this.splitSize);
    }
    callback();
  }

  _flush(callback) {
    if (this.buffer.length > 0) {
      this.push(this.buffer);
    }
    callback();
  }
}

pipeline(
  fs.createReadStream('input.txt'),
  new Splitter(1024), // Process data in 1KB chunks
  fs.createWriteStream('output.txt'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);
```

---

### **8. Real-World Use Cases**
#### Streaming Compression
Compress data on-the-fly using a Transform stream.

```javascript
const zlib = require('zlib');
const fs = require('fs');

const gzip = zlib.createGzip();
fs.createReadStream('input.txt')
  .pipe(gzip)
  .pipe(fs.createWriteStream('input.txt.gz'));
```

#### Real-Time Analytics
Analyze incoming data streams in real-time.

```javascript
const { Transform } = require('stream');

class Analytics extends Transform {
  constructor() {
    super();
    this.wordCount = 0;
  }

  _transform(chunk, encoding, callback) {
    this.wordCount += chunk.toString().split(' ').length;
    this.push(chunk);
    callback();
  }

  _flush(callback) {
    console.log('Total word count:', this.wordCount);
    callback();
  }
}

fs.createReadStream('input.txt')
  .pipe(new Analytics())
  .pipe(fs.createWriteStream('output.txt'));
```

---

### **9. Stream Debugging Tools**
- **`node:trace_events`**: Use `node --trace-event-categories` to monitor stream operations.
- **`process.memoryUsage()`**: Track memory usage during stream operations.
- **`stream.pipeline`**: Automatically logs errors and manages cleanup.

---

### **Practice Project Ideas**
1. **File Merger**: Combine multiple files into one using streams.
2. **Chat System**: Use duplex streams to build a simple chat application.
3. **Custom Data Encryption**: Create a Transform stream that encrypts and decrypts data.

Let me know if you'd like detailed guidance or code for any of these advanced use cases!