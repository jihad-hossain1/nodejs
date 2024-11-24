### **Advanced Topics in Event Emitters**

The `EventEmitter` in Node.js provides powerful tools for managing event-driven programming. Let’s explore its advanced capabilities and best practices to maximize its usage.

---

### **1. Customizing EventEmitter Behavior**
You can create specialized versions of the EventEmitter by extending it or modifying its behavior.

#### Extending EventEmitter:
```javascript
const EventEmitter = require('events');

class CustomEmitter extends EventEmitter {
  customMethod() {
    console.log('Custom method executed');
    this.emit('customEvent', 'Custom data');
  }
}

const emitter = new CustomEmitter();
emitter.on('customEvent', (data) => {
  console.log('Custom event received:', data);
});

emitter.customMethod();
```

---

### **2. Using Wildcard Events**
While Node.js `EventEmitter` does not natively support wildcard events, you can use libraries like [`eventemitter3`](https://www.npmjs.com/package/eventemitter3) or implement a custom solution.

#### Example with a Library:
```javascript
const EventEmitter = require('eventemitter3');

const emitter = new EventEmitter();
emitter.on('user.*', (data) => {
  console.log('Wildcard event received:', data);
});

emitter.emit('user.login', { user: 'Alice' });
emitter.emit('user.logout', { user: 'Bob' });
```

---

### **3. Asynchronous Listeners**
Listeners can perform asynchronous tasks using `async/await`. The `EventEmitter` does not natively await listener completion, but you can handle it manually.

#### Example:
```javascript
const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on('asyncEvent', async (data) => {
  console.log('Start processing:', data);
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async work
  console.log('Finished processing:', data);
});

emitter.emit('asyncEvent', 'Sample Data');
```

#### Awaiting All Listeners (Custom Implementation):
```javascript
const emitAsync = async (emitter, event, ...args) => {
  const listeners = emitter.listeners(event);
  for (const listener of listeners) {
    await listener(...args);
  }
};

const emitter = new EventEmitter();

emitter.on('asyncEvent', async (data) => {
  console.log('Listener 1:', data);
});

emitter.on('asyncEvent', async (data) => {
  console.log('Listener 2:', data);
});

emitAsync(emitter, 'asyncEvent', 'Sample Data');
```

---

### **4. Event Namespaces**
Using string patterns or object-based keys as event names can help organize events.

#### Example:
```javascript
const emitter = new EventEmitter();

emitter.on('user:login', (data) => console.log('User logged in:', data));
emitter.on('user:logout', (data) => console.log('User logged out:', data));

emitter.emit('user:login', { userId: 1 });
emitter.emit('user:logout', { userId: 2 });
```

---

### **5. Handling Large Numbers of Listeners**
The default maximum listeners for a single event is 10. Exceeding this logs a warning. You can increase the limit or optimize the listeners.

#### Increase Listener Limit:
```javascript
emitter.setMaxListeners(50);
```

#### Optimize Listeners with `.prependListener()`:
```javascript
emitter.on('event', () => console.log('Listener 1'));
emitter.prependListener('event', () => console.log('Listener 2'));

// Output: Listener 2, Listener 1
emitter.emit('event');
```

---

### **6. Error Event Propagation**
The `error` event is special. If an `error` event is emitted without a listener, the process crashes. You can implement custom error propagation.

#### Example:
```javascript
const emitter = new EventEmitter();

emitter.on('error', (err) => {
  console.error('Error caught:', err.message);
});

emitter.emit('error', new Error('Something went wrong'));
```

#### Custom Error Propagation:
```javascript
class CustomEmitter extends EventEmitter {
  emit(event, ...args) {
    if (event === 'error' && this.listenerCount('error') === 0) {
      console.error('Unhandled error:', ...args);
    } else {
      super.emit(event, ...args);
    }
  }
}

const emitter = new CustomEmitter();
emitter.emit('error', new Error('Critical failure'));
```

---

### **7. Event Priority Management**
By default, listeners are executed in the order they are added. Use `prependListener` or custom sorting for priority.

#### Example:
```javascript
const emitter = new EventEmitter();

emitter.on('event', () => console.log('Listener 1'));
emitter.prependListener('event', () => console.log('High Priority Listener'));

emitter.emit('event');
```

---

### **8. EventEmitter in Clustered or Distributed Systems**
In complex systems, EventEmitters can be combined with inter-process communication (IPC) to handle distributed events.

#### Example with Child Processes:
```javascript
const { fork } = require('child_process');
const EventEmitter = require('events');

const emitter = new EventEmitter();
const child = fork('./child.js'); // Assume child.js contains event handling logic

emitter.on('message', (msg) => console.log('Message from child:', msg));

child.on('message', (msg) => emitter.emit('message', msg));
child.send('Hello, Child!');
```

---

### **9. Debugging and Monitoring Events**
Node.js provides tools like `node:trace_events` and custom logging for monitoring.

#### Example:
```javascript
emitter.on('newListener', (event, listener) => {
  console.log(`Listener added for event: ${event}`);
});

emitter.on('event', () => console.log('Event triggered'));
```

---

### **10. Combining EventEmitters with Observables**
Use libraries like RxJS to create reactive streams with `EventEmitter`.

#### Example with RxJS:
```javascript
const { fromEvent } = require('rxjs');
const EventEmitter = require('events');

const emitter = new EventEmitter();
const event$ = fromEvent(emitter, 'data');

event$.subscribe((data) => console.log('Reactive Listener:', data));

emitter.emit('data', { key: 'value' });
```

---

### **11. EventEmitter Memory Leak Prevention**
- **Remove unused listeners:** Use `off` or `removeAllListeners`.
- **Monitor active listeners:**
  ```javascript
  console.log(emitter.listenerCount('event'));
  ```
- **Automate listener removal after execution:**
  ```javascript
  emitter.on('event', function listener(data) {
    console.log('Event:', data);
    emitter.off('event', listener); // Remove after execution
  });
  ```

---

### **12. EventEmitter in Real-World Scenarios**
#### Logging System:
```javascript
class Logger extends EventEmitter {
  log(message) {
    console.log(message);
    this.emit('log', message);
  }
}

const logger = new Logger();
logger.on('log', (msg) => console.log('Logged:', msg));
logger.log('Hello, EventEmitters!');
```

#### HTTP Request Events:
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  server.emit('requestReceived', { method: req.method, url: req.url });
  res.end('Hello World');
});

server.on('requestReceived', (data) => {
  console.log('Request:', data);
});

server.listen(3000, () => console.log('Server running on port 3000'));
```

---

### Best Practices
1. **Use Meaningful Event Names:** Make names descriptive for better maintainability.
2. **Limit the Number of Listeners:** Avoid excessive listeners to prevent memory leaks.
3. **Handle `error` Events:** Always include an error listener to prevent crashes.
4. **Leverage `.once()` for One-Time Events:** Optimize when events are needed only once.
5. **Use Libraries for Complex Scenarios:** Use `eventemitter3` or RxJS for advanced functionality.

---

Let me know if you want help with any of these advanced examples or have specific questions!