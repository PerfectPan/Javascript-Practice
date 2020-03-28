function Promise(executor) {
	this.status = "pending";
	this.value = undefined;
	this.onResolvedCallback = [];
	this.onRejectedCallback = [];

	const resolve = (value) => {
    setTimeout(() => {
      if (this.status === "pending") {
        this.status = "fulfilled";
        this.value = value;
        this.onResolvedCallback.forEach(fn => fn(this.value));
      }
    });
	}

	const reject = (reason) => {
    setTimeout(() => {
      if (this.status === "pending") {
        this.status = "rejected";
        this.value = reason;
        this.onRejectedCallback.forEach(fn => fn(this.value));
      }
    });
	}

	try {
		executor(resolve, reject);
	} catch (e) {
		reject(e);
	}
}

Promise.prototype.then = function(onFulfilled, onRejected) {
	onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
	onRejected = typeof onRejected === "function" ? onRejected : reason => {throw reason;};

  let returnedPromise = null;

  if (this.status === 'pending') {
    return returnedPromise = new Promise((resolve, reject) => {
      this.onResolvedCallback.push((value) => {
        try {
          const x = onFulfilled(value);
          ResolutionProcedure(returnedPromise, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      });
      this.onRejectedCallback.push((reason) => {
        try {
          const x = onRejected(reason);
          ResolutionProcedure(returnedPromise, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      });
    });
  } else if (this.status === 'fulfilled') {
    return returnedPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const x = onFulfilled(this.value);
          ResolutionProcedure(returnedPromise, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      });
    });
  } else if (this.status === 'rejected') {
    return returnedPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const x = onRejected(this.value);
          ResolutionProcedure(returnedPromise, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      });
    });
  }
};

Promise.prototype.catch = function(onRejected) {
	return this.then(null, onRejected);
};

function ResolutionProcedure(promise, x, resolve, reject) {
  try {
    if (promise === x) {
      reject(new TypeError('Chaining cycle detected for promise'));
      return;
    }
    if (x instanceof Promise) {
      x.then((value) => {
        ResolutionProcedure(promise, value, resolve, reject);
      }, (reason) => {
        reject(reason);
      });
      return;
    } 
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let called = false;
      try {
        const then = x.then;
        if (typeof then === 'function') {
          then.call(x, (value) => {
            if (called) return;
            called = true;
            ResolutionProcedure(promise, value, resolve, reject);
          }, (reason) => {
            if (called) return;
            called = true;
            reject(reason);
          });
        } else {
          resolve(x);
        }
      } catch(e) {
        if (called) return;
        called = true;
        reject(e);
      }
    } else {
      resolve(x);
    }
  } catch(e) {
    reject(e);
  }
}


Promise.deferred = function() {
	let defer = {};
	defer.promise = new Promise((resolve, reject) => {
		defer.resolve = resolve;
		defer.reject = reject;
	});
	return defer;
}

module.exports = Promise;