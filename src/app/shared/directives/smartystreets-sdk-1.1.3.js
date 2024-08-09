(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SmartyStreetsSDK = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = {
	core: {
		Batch: require("./src/Batch"),
		ClientBuilder: require("./src/ClientBuilder"),
		SharedCredentials: require("./src/SharedCredentials"),
		StaticCredentials: require("./src/StaticCredentials"),
		Errors: require("./src/Errors")
	},
	usStreet: {
		Lookup: require("./src/us_street/Lookup")
	},
	usZipcode: {
		Lookup: require("./src/us_zipcode/Lookup")
	},
	usAutocomplete: {
		Lookup: require("./src/us_autocomplete/Lookup")
	},
	usExtract: {
		Lookup: require("./src/us_extract/Lookup")
	},
	internationalStreet: {
		Lookup: require("./src/international_street/Lookup")
	}
};

},{"./src/Batch":45,"./src/ClientBuilder":46,"./src/Errors":48,"./src/SharedCredentials":53,"./src/StaticCredentials":55,"./src/international_street/Lookup":59,"./src/us_autocomplete/Lookup":61,"./src/us_extract/Lookup":65,"./src/us_street/Lookup":69,"./src/us_zipcode/Lookup":71}],2:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":3}],3:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` or `self` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.

/* globals self */
var scope = typeof global !== "undefined" ? global : self;
var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":6}],5:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require('./../helpers/btoa');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))
},{"../core/createError":12,"./../core/settle":15,"./../helpers/btoa":19,"./../helpers/buildURL":20,"./../helpers/cookies":22,"./../helpers/isURLSameOrigin":24,"./../helpers/parseHeaders":26,"./../utils":28,"_process":33}],6:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":7,"./cancel/CancelToken":8,"./cancel/isCancel":9,"./core/Axios":10,"./defaults":17,"./helpers/bind":18,"./helpers/spread":27,"./utils":28}],7:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],8:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":7}],9:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],10:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":17,"./../utils":28,"./InterceptorManager":11,"./dispatchRequest":13}],11:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":28}],12:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":14}],13:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":9,"../defaults":17,"./../helpers/combineURLs":21,"./../helpers/isAbsoluteURL":23,"./../utils":28,"./transformData":16}],14:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

},{}],15:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":12}],16:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":28}],17:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))
},{"./adapters/http":5,"./adapters/xhr":5,"./helpers/normalizeHeaderName":25,"./utils":28,"_process":33}],18:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],19:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],20:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":28}],21:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],22:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":28}],23:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],24:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":28}],25:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":28}],26:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":28}],27:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],28:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":18,"is-buffer":31}],29:[function(require,module,exports){
module.exports = require('./lib/index').default;
},{"./lib/index":30}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNetworkError = isNetworkError;
exports.isRetryableError = isRetryableError;
exports.isSafeRequestError = isSafeRequestError;
exports.isIdempotentRequestError = isIdempotentRequestError;
exports.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
exports.exponentialDelay = exponentialDelay;
exports.default = axiosRetry;

var _isRetryAllowed = require('is-retry-allowed');

var _isRetryAllowed2 = _interopRequireDefault(_isRetryAllowed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var namespace = 'axios-retry';

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isNetworkError(error) {
  return !error.response && Boolean(error.code) // Prevents retrying cancelled requests
  && error.code !== 'ECONNABORTED' // Prevents retrying timed out requests
  && (0, _isRetryAllowed2.default)(error); // Prevents retrying unsafe errors
}

var SAFE_HTTP_METHODS = ['get', 'head', 'options'];
var IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(['put', 'delete']);

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isRetryableError(error) {
  return error.code !== 'ECONNABORTED' && (!error.response || error.response.status >= 500 && error.response.status <= 599);
}

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isSafeRequestError(error) {
  if (!error.config) {
    // Cannot determine if the request can be retried
    return false;
  }

  return isRetryableError(error) && SAFE_HTTP_METHODS.indexOf(error.config.method) !== -1;
}

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isIdempotentRequestError(error) {
  if (!error.config) {
    // Cannot determine if the request can be retried
    return false;
  }

  return isRetryableError(error) && IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method) !== -1;
}

/**
 * @param  {Error}  error
 * @return {boolean}
 */
function isNetworkOrIdempotentRequestError(error) {
  return isNetworkError(error) || isIdempotentRequestError(error);
}

/**
 * @return {number} - delay in milliseconds, always 0
 */
function noDelay() {
  return 0;
}

/**
 * @param  {number} [retryNumber=0]
 * @return {number} - delay in milliseconds
 */
function exponentialDelay() {
  var retryNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  var delay = Math.pow(2, retryNumber) * 100;
  var randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
  return delay + randomSum;
}

/**
 * Initializes and returns the retry state for the given request/config
 * @param  {AxiosRequestConfig} config
 * @return {Object}
 */
function getCurrentState(config) {
  var currentState = config[namespace] || {};
  currentState.retryCount = currentState.retryCount || 0;
  config[namespace] = currentState;
  return currentState;
}

/**
 * Returns the axios-retry options for the current request
 * @param  {AxiosRequestConfig} config
 * @param  {AxiosRetryConfig} defaultOptions
 * @return {AxiosRetryConfig}
 */
function getRequestOptions(config, defaultOptions) {
  return Object.assign({}, defaultOptions, config[namespace]);
}

/**
 * @param  {Axios} axios
 * @param  {AxiosRequestConfig} config
 */
function fixConfig(axios, config) {
  if (axios.defaults.agent === config.agent) {
    delete config.agent;
  }
  if (axios.defaults.httpAgent === config.httpAgent) {
    delete config.httpAgent;
  }
  if (axios.defaults.httpsAgent === config.httpsAgent) {
    delete config.httpsAgent;
  }
}

/**
 * Adds response interceptors to an axios instance to retry requests failed due to network issues
 *
 * @example
 *
 * import axios from 'axios';
 *
 * axiosRetry(axios, { retries: 3 });
 *
 * axios.get('http://example.com/test') // The first request fails and the second returns 'ok'
 *   .then(result => {
 *     result.data; // 'ok'
 *   });
 *
 * // Exponential back-off retry delay between requests
 * axiosRetry(axios, { retryDelay : axiosRetry.exponentialDelay});
 *
 * // Custom retry delay
 * axiosRetry(axios, { retryDelay : (retryCount) => {
 *   return retryCount * 1000;
 * }});
 *
 * // Also works with custom axios instances
 * const client = axios.create({ baseURL: 'http://example.com' });
 * axiosRetry(client, { retries: 3 });
 *
 * client.get('/test') // The first request fails and the second returns 'ok'
 *   .then(result => {
 *     result.data; // 'ok'
 *   });
 *
 * // Allows request-specific configuration
 * client
 *   .get('/test', {
 *     'axios-retry': {
 *       retries: 0
 *     }
 *   })
 *   .catch(error => { // The first request fails
 *     error !== undefined
 *   });
 *
 * @param {Axios} axios An axios instance (the axios object or one created from axios.create)
 * @param {Object} [defaultOptions]
 * @param {number} [defaultOptions.retries=3] Number of retries
 * @param {boolean} [defaultOptions.shouldResetTimeout=false]
 *        Defines if the timeout should be reset between retries
 * @param {Function} [defaultOptions.retryCondition=isNetworkOrIdempotentRequestError]
 *        A function to determine if the error can be retried
 * @param {Function} [defaultOptions.retryDelay=noDelay]
 *        A function to determine the delay between retry requests
 */
function axiosRetry(axios, defaultOptions) {
  axios.interceptors.request.use(function (config) {
    var currentState = getCurrentState(config);
    currentState.lastRequestTime = Date.now();
    return config;
  });

  axios.interceptors.response.use(null, function (error) {
    var config = error.config;

    // If we have no information to retry the request
    if (!config) {
      return Promise.reject(error);
    }

    var _getRequestOptions = getRequestOptions(config, defaultOptions),
        _getRequestOptions$re = _getRequestOptions.retries,
        retries = _getRequestOptions$re === undefined ? 3 : _getRequestOptions$re,
        _getRequestOptions$re2 = _getRequestOptions.retryCondition,
        retryCondition = _getRequestOptions$re2 === undefined ? isNetworkOrIdempotentRequestError : _getRequestOptions$re2,
        _getRequestOptions$re3 = _getRequestOptions.retryDelay,
        retryDelay = _getRequestOptions$re3 === undefined ? noDelay : _getRequestOptions$re3,
        _getRequestOptions$sh = _getRequestOptions.shouldResetTimeout,
        shouldResetTimeout = _getRequestOptions$sh === undefined ? false : _getRequestOptions$sh;

    var currentState = getCurrentState(config);

    var shouldRetry = retryCondition(error) && currentState.retryCount < retries;

    if (shouldRetry) {
      currentState.retryCount++;
      var delay = retryDelay(currentState.retryCount, error);

      // Axios fails merging this configuration to the default configuration because it has an issue
      // with circular structures: https://github.com/mzabriskie/axios/issues/370
      fixConfig(axios, config);

      if (!shouldResetTimeout && config.timeout && currentState.lastRequestTime) {
        var lastRequestDuration = Date.now() - currentState.lastRequestTime;
        // Minimum 1ms timeout (passing 0 or less to XHR means no timeout)
        config.timeout = Math.max(config.timeout - lastRequestDuration - delay, 1);
      }

      return new Promise(function (resolve) {
        return setTimeout(function () {
          return resolve(axios(config));
        }, delay);
      });
    }

    return Promise.reject(error);
  });
}

// Compatibility with CommonJS
axiosRetry.isNetworkError = isNetworkError;
axiosRetry.isSafeRequestError = isSafeRequestError;
axiosRetry.isIdempotentRequestError = isIdempotentRequestError;
axiosRetry.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
axiosRetry.exponentialDelay = exponentialDelay;
axiosRetry.isRetryableError = isRetryableError;

},{"is-retry-allowed":32}],31:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],32:[function(require,module,exports){
'use strict';

var WHITELIST = [
	'ETIMEDOUT',
	'ECONNRESET',
	'EADDRINUSE',
	'ESOCKETTIMEDOUT',
	'ECONNREFUSED',
	'EPIPE'
];

var BLACKLIST = [
	'ENOTFOUND',
	'ENETUNREACH',

	// SSL errors from https://github.com/nodejs/node/blob/ed3d8b13ee9a705d89f9e0397d9e96519e7e47ac/src/node_crypto.cc#L1950
	'UNABLE_TO_GET_ISSUER_CERT',
	'UNABLE_TO_GET_CRL',
	'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
	'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
	'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
	'CERT_SIGNATURE_FAILURE',
	'CRL_SIGNATURE_FAILURE',
	'CERT_NOT_YET_VALID',
	'CERT_HAS_EXPIRED',
	'CRL_NOT_YET_VALID',
	'CRL_HAS_EXPIRED',
	'ERROR_IN_CERT_NOT_BEFORE_FIELD',
	'ERROR_IN_CERT_NOT_AFTER_FIELD',
	'ERROR_IN_CRL_LAST_UPDATE_FIELD',
	'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
	'OUT_OF_MEM',
	'DEPTH_ZERO_SELF_SIGNED_CERT',
	'SELF_SIGNED_CERT_IN_CHAIN',
	'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
	'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
	'CERT_CHAIN_TOO_LONG',
	'CERT_REVOKED',
	'INVALID_CA',
	'PATH_LENGTH_EXCEEDED',
	'INVALID_PURPOSE',
	'CERT_UNTRUSTED',
	'CERT_REJECTED'
];

module.exports = function (err) {
	if (!err || !err.code) {
		return true;
	}

	if (WHITELIST.indexOf(err.code) !== -1) {
		return true;
	}

	if (BLACKLIST.indexOf(err.code) !== -1) {
		return false;
	}

	return true;
};

},{}],33:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],34:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":39}],35:[function(require,module,exports){
'use strict';

var asap = require('asap/raw');

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('Promise constructor\'s argument is not a function');
  }
  this._75 = 0;
  this._83 = 0;
  this._18 = null;
  this._38 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._47 = null;
Promise._71 = null;
Promise._44 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
}
function handle(self, deferred) {
  while (self._83 === 3) {
    self = self._18;
  }
  if (Promise._47) {
    Promise._47(self);
  }
  if (self._83 === 0) {
    if (self._75 === 0) {
      self._75 = 1;
      self._38 = deferred;
      return;
    }
    if (self._75 === 1) {
      self._75 = 2;
      self._38 = [self._38, deferred];
      return;
    }
    self._38.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._83 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._83 === 1) {
        resolve(deferred.promise, self._18);
      } else {
        reject(deferred.promise, self._18);
      }
      return;
    }
    var ret = tryCallOne(cb, self._18);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._83 = 3;
      self._18 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._83 = 1;
  self._18 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._83 = 2;
  self._18 = newValue;
  if (Promise._71) {
    Promise._71(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._75 === 1) {
    handle(self, self._38);
    self._38 = null;
  }
  if (self._75 === 2) {
    for (var i = 0; i < self._38.length; i++) {
      handle(self, self._38[i]);
    }
    self._38 = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  });
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"asap/raw":3}],36:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"./core.js":35}],37:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._44);
  p._83 = 1;
  p._18 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._83 === 3) {
            val = val._18;
          }
          if (val._83 === 1) return res(i, val._18);
          if (val._83 === 2) reject(val._18);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"./core.js":35}],38:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"./core.js":35}],39:[function(require,module,exports){
'use strict';

module.exports = require('./core.js');
require('./done.js');
require('./finally.js');
require('./es6-extensions.js');
require('./node-extensions.js');
require('./synchronous.js');

},{"./core.js":35,"./done.js":36,"./es6-extensions.js":37,"./finally.js":38,"./node-extensions.js":40,"./synchronous.js":41}],40:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require('./core.js');
var asap = require('asap');

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
};

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
};

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
};

},{"./core.js":35,"asap":2}],41:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._83 === 3) {
      return this._18.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._18;
  };

  Promise.prototype.getReason = function () {
    if (this._83 === 3) {
      return this._18.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._18;
  };

  Promise.prototype.getState = function () {
    if (this._83 === 3) {
      return this._18.getState();
    }
    if (this._83 === -1 || this._83 === -2) {
      return 0;
    }

    return this._83;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};

},{"./core.js":35}],42:[function(require,module,exports){
module.exports={
 "name": "smartystreets-javascript-sdk",
 "version": "1.1.3",
 "description": "Quick and easy SmartyStreets address validation.",
 "keywords": [
  "smartystreets",
  "address",
  "validation",
  "verification",
  "verify",
  "validate",
  "street-address",
  "geocoding",
  "addresses",
  "zipcode",
  "autocomplete",
  "autosuggest",
  "suggestions",
  "international",
  "http",
  "sdk"
 ],
 "main": "index.js",
 "scripts": {
  "test": "mocha 'tests/**/*.js'"
 },
 "author": "SmartyStreets SDK Team <support@smartystreets.com> (https://www.smartystreets.com)",
 "license": "Apache-2.0",
 "repository": {
  "type": "git",
  "url": "github:smartystreets/smartystreets-javascript-sdk"
 },
 "devDependencies": {
  "aws-sdk": "^2.224.1",
  "babel-core": "^6.26.0",
  "babel-preset-env": "^1.6.1",
  "babelify": "^8.0.0",
  "browserify": "^16.2.0",
  "chai": "^4.1.2",
  "chai-as-promised": "^7.1.1",
  "mocha": "^5.0.5",
  "s3-upload-stream": "^1.0.7",
  "tinyify": "^2.4.0",
  "zlib": "^1.0.5"
 },
 "dependencies": {
  "axios-proxy-fix": "^0.16.3",
  "axios-retry": "^3.0.1",
  "promise": "^8.0.1"
 }
}

},{}],43:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("promise");

var AgentSender = function () {
	function AgentSender(innerSender) {
		_classCallCheck(this, AgentSender);

		this.sender = innerSender;
	}

	_createClass(AgentSender, [{
		key: "send",
		value: function send(request) {
			var _this = this;

			request.parameters.agent = "smartystreets (sdk:javascript@" + require("../package.json").version + ")";
			return new Promise(function (resolve, reject) {
				_this.sender.send(request).then(resolve).catch(reject);
			});
		}
	}]);

	return AgentSender;
}();

module.exports = AgentSender;

},{"../package.json":42,"promise":34}],44:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("promise");

var BaseUrlSender = function () {
	function BaseUrlSender(innerSender, urlOverride) {
		_classCallCheck(this, BaseUrlSender);

		this.urlOverride = urlOverride;
		this.sender = innerSender;
	}

	_createClass(BaseUrlSender, [{
		key: "send",
		value: function send(request) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				request.baseUrl = _this.urlOverride;

				_this.sender.send(request).then(resolve).catch(reject);
			});
		}
	}]);

	return BaseUrlSender;
}();

module.exports = BaseUrlSender;

},{"promise":34}],45:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BatchFullError = require("./Errors").BatchFullError;

/**
 * This class contains a collection of up to 100 lookups to be sent to one of the SmartyStreets APIs<br>
 *     all at once. This is more efficient than sending them one at a time.
 */

var Batch = function () {
	function Batch() {
		_classCallCheck(this, Batch);

		this.lookups = [];
	}

	_createClass(Batch, [{
		key: "add",
		value: function add(lookup) {
			if (this.lookupsHasRoomForLookup()) this.lookups.push(lookup);else throw new BatchFullError();
		}
	}, {
		key: "lookupsHasRoomForLookup",
		value: function lookupsHasRoomForLookup() {
			var maxNumberOfLookups = 100;
			return this.lookups.length < maxNumberOfLookups;
		}
	}, {
		key: "length",
		value: function length() {
			return this.lookups.length;
		}
	}, {
		key: "getByIndex",
		value: function getByIndex(index) {
			return this.lookups[index];
		}
	}, {
		key: "getByInputId",
		value: function getByInputId(inputId) {
			return this.lookups.filter(function (lookup) {
				return lookup.inputId === inputId;
			})[0];
		}

		/**
   * Clears the lookups stored in the batch so it can be used again.<br>
   *     This helps avoid the overhead of building a new Batch object for each group of lookups.
   */

	}, {
		key: "clear",
		value: function clear() {
			this.lookups = [];
		}
	}, {
		key: "isEmpty",
		value: function isEmpty() {
			return this.length() === 0;
		}
	}]);

	return Batch;
}();

module.exports = Batch;

},{"./Errors":48}],46:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HttpSender = require("./HttpSender");
var SigningSender = require("./SigningSender");
var BaseUrlSender = require("./BaseUrlSender");
var AgentSender = require("./AgentSender");
var StaticCredentials = require("./StaticCredentials");
var SharedCredentials = require("./SharedCredentials");
var CustomHeaderSender = require("./CustomHeaderSender");
var StatusCodeSender = require("./StatusCodeSender");
var BadCredentialsError = require("./Errors").BadCredentialsError;

//TODO: refactor this to work more cleanly with a bundler.
var UsStreetClient = require("./us_street/Client");
var UsZipcodeClient = require("./us_zipcode/Client");
var UsAutocompleteClient = require("./us_autocomplete/Client");
var UsExtractClient = require("./us_extract/Client");
var InternationalStreetClient = require("./international_street/Client");

var INTERNATIONAL_STREET_API_URI = "https://international-street.api.smartystreets.com/verify";
var US_AUTOCOMPLETE_API_URL = "https://us-autocomplete.api.smartystreets.com/suggest";
var US_EXTRACT_API_URL = "https://us-extract.api.smartystreets.com/";
var US_STREET_API_URL = "https://us-street.api.smartystreets.com/street-address";
var US_ZIP_CODE_API_URL = "https://us-zipcode.api.smartystreets.com/lookup";

/**
 * The ClientBuilder class helps you build a client object for one of the supported SmartyStreets APIs.<br>
 * You can use ClientBuilder's methods to customize settings like maximum retries or timeout duration. These methods<br>
 * are chainable, so you can usually get set up with one line of code.
 */

var ClientBuilder = function () {
	function ClientBuilder(signer) {
		_classCallCheck(this, ClientBuilder);

		if (noCredentialsProvided()) throw new BadCredentialsError();

		this.signer = signer;
		this.httpSender = undefined;
		this.maxRetries = 5;
		this.maxTimeout = 10000;
		this.baseUrl = undefined;
		this.proxy = undefined;
		this.customHeaders = {};
		this.debug = undefined;

		function noCredentialsProvided() {
	    	return !signer instanceof StaticCredentials || !signer instanceof SharedCredentials;
  	}
	}

	/**
  * @param retries The maximum number of times to retry sending the request to the API. (Default is 5)
  * @return Returns <b>this</b> to accommodate method chaining.
  */


	_createClass(ClientBuilder, [{
		key: "withMaxRetries",
		value: function withMaxRetries(retries) {
			this.maxRetries = retries;
			return this;
		}

		/**
   * @param timeout The maximum time (in milliseconds) to wait for a connection, and also to wait for <br>
   *                   the response to be read. (Default is 10000)
   * @return Returns <b>this</b> to accommodate method chaining.
   */

	}, {
		key: "withMaxTimeout",
		value: function withMaxTimeout(timeout) {
			this.maxTimeout = timeout;
			return this;
		}

		/**
   * @param sender Default is a series of nested senders. See <b>buildSender()</b>.
   * @return Returns <b>this</b> to accommodate method chaining.
   */

	}, {
		key: "withSender",
		value: function withSender(sender) {
			this.httpSender = sender;
			return this;
		}

		/**
   * This may be useful when using a local installation of the SmartyStreets APIs.
   * @param url Defaults to the URL for the API corresponding to the <b>Client</b> object being built.
   * @return Returns <b>this</b> to accommodate method chaining.
   */

	}, {
		key: "withBaseUrl",
		value: function withBaseUrl(url) {
			this.baseUrl = url;
			return this;
		}

		/**
   * Use this to specify a proxy through which to send all lookups.
   * @param host The host of the proxy server (do not include the port).
   * @param port The port on the proxy server to which you wish to connect.
   * @param username The username to login to the proxy.
   * @param password The password to login to the proxy.
   * @return Returns <b>this</b> to accommodate method chaining.
   */

	}, {
		key: "withProxy",
		value: function withProxy(host, port, username, password) {
			this.proxy = {
				host: host,
				port: port
			};

			if (username && password) {
				this.proxy.auth = {
					username: username,
					password: password
				};
			}

			return this;
		}

		/**
   * Use this to add any additional headers you need.
   * @param customHeaders A String to Object <b>Map</b> of header name/value pairs.
   * @return Returns <b>this</b> to accommodate method chaining.
   */

	}, {
		key: "withCustomHeaders",
		value: function withCustomHeaders(customHeaders) {
			this.customHeaders = customHeaders;

			return this;
		}

		/**
   * Enables debug mode, which will print information about the HTTP request and response to console.log
   * @return Returns <b>this</b> to accommodate method chaining.
   */

	}, {
		key: "withDebug",
		value: function withDebug() {
			this.debug = true;

			return this;
		}
	}, {
		key: "buildSender",
		value: function buildSender() {
			if (this.httpSender) return this.httpSender;

			var httpSender = new HttpSender(this.maxTimeout, this.maxRetries, this.proxy, this.debug);
			var statusCodeSender = new StatusCodeSender(httpSender);
			var signingSender = new SigningSender(statusCodeSender, this.signer);
			var agentSender = new AgentSender(signingSender);
			var customHeaderSender = new CustomHeaderSender(agentSender, this.customHeaders);
			var baseUrlSender = new BaseUrlSender(customHeaderSender, this.baseUrl);

			return baseUrlSender;
		}
	}, {
		key: "buildClient",
		value: function buildClient(baseUrl, Client) {
			if (!this.baseUrl) {
				this.baseUrl = baseUrl;
			}

			return new Client(this.buildSender());
		}
	}, {
		key: "buildUsStreetApiClient",
		value: function buildUsStreetApiClient() {
			return this.buildClient(US_STREET_API_URL, UsStreetClient);
		}
	}, {
		key: "buildUsZipcodeClient",
		value: function buildUsZipcodeClient() {
			return this.buildClient(US_ZIP_CODE_API_URL, UsZipcodeClient);
		}
	}, {
		key: "buildUsAutocompleteClient",
		value: function buildUsAutocompleteClient() {
			return this.buildClient(US_AUTOCOMPLETE_API_URL, UsAutocompleteClient);
		}
	}, {
		key: "buildUsExtractClient",
		value: function buildUsExtractClient() {
			return this.buildClient(US_EXTRACT_API_URL, UsExtractClient);
		}
	}, {
		key: "buildInternationalStreetClient",
		value: function buildInternationalStreetClient() {
			return this.buildClient(INTERNATIONAL_STREET_API_URI, InternationalStreetClient);
		}
	}]);

	return ClientBuilder;
}();

module.exports = ClientBuilder;

},{"./AgentSender":43,"./BaseUrlSender":44,"./CustomHeaderSender":47,"./Errors":48,"./HttpSender":49,"./SharedCredentials":53,"./SigningSender":54,"./StaticCredentials":55,"./StatusCodeSender":56,"./international_street/Client":58,"./us_autocomplete/Client":60,"./us_extract/Client":64,"./us_street/Client":68,"./us_zipcode/Client":70}],47:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("promise");

var CustomHeaderSender = function () {
	function CustomHeaderSender(innerSender, customHeaders) {
		_classCallCheck(this, CustomHeaderSender);

		this.sender = innerSender;
		this.customHeaders = customHeaders;
	}

	_createClass(CustomHeaderSender, [{
		key: "send",
		value: function send(request) {
			var _this = this;

			for (var key in this.customHeaders) {
				request.headers[key] = this.customHeaders[key];
			}

			return new Promise(function (resolve, reject) {
				_this.sender.send(request).then(resolve).catch(reject);
			});
		}
	}]);

	return CustomHeaderSender;
}();

module.exports = CustomHeaderSender;

},{"promise":34}],48:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SmartyError = function (_Error) {
	_inherits(SmartyError, _Error);

	function SmartyError(message) {
		_classCallCheck(this, SmartyError);

		return _possibleConstructorReturn(this, (SmartyError.__proto__ || Object.getPrototypeOf(SmartyError)).call(this, message));
	}

	return SmartyError;
}(Error);

var BatchFullError = function (_SmartyError) {
	_inherits(BatchFullError, _SmartyError);

	function BatchFullError() {
		_classCallCheck(this, BatchFullError);

		return _possibleConstructorReturn(this, (BatchFullError.__proto__ || Object.getPrototypeOf(BatchFullError)).call(this, "A batch can contain a max of 100 lookups."));
	}

	return BatchFullError;
}(SmartyError);

var BatchEmptyError = function (_SmartyError2) {
	_inherits(BatchEmptyError, _SmartyError2);

	function BatchEmptyError() {
		_classCallCheck(this, BatchEmptyError);

		return _possibleConstructorReturn(this, (BatchEmptyError.__proto__ || Object.getPrototypeOf(BatchEmptyError)).call(this, "A batch must contain at least 1 lookup."));
	}

	return BatchEmptyError;
}(SmartyError);

var UndefinedLookupError = function (_SmartyError3) {
	_inherits(UndefinedLookupError, _SmartyError3);

	function UndefinedLookupError() {
		_classCallCheck(this, UndefinedLookupError);

		return _possibleConstructorReturn(this, (UndefinedLookupError.__proto__ || Object.getPrototypeOf(UndefinedLookupError)).call(this, "The lookup provided is missing or undefined. Make sure you're passing a Lookup object."));
	}

	return UndefinedLookupError;
}(SmartyError);

var BadCredentialsError = function (_SmartyError4) {
	_inherits(BadCredentialsError, _SmartyError4);

	function BadCredentialsError() {
		_classCallCheck(this, BadCredentialsError);

		return _possibleConstructorReturn(this, (BadCredentialsError.__proto__ || Object.getPrototypeOf(BadCredentialsError)).call(this, "Unauthorized: The credentials were provided incorrectly or did not match any existing active credentials."));
	}

	return BadCredentialsError;
}(SmartyError);

var PaymentRequiredError = function (_SmartyError5) {
	_inherits(PaymentRequiredError, _SmartyError5);

	function PaymentRequiredError() {
		_classCallCheck(this, PaymentRequiredError);

		return _possibleConstructorReturn(this, (PaymentRequiredError.__proto__ || Object.getPrototypeOf(PaymentRequiredError)).call(this, "Payment Required: There is no active subscription for the account associated with the credentials submitted with the request."));
	}

	return PaymentRequiredError;
}(SmartyError);

var RequestEntityTooLargeError = function (_SmartyError6) {
	_inherits(RequestEntityTooLargeError, _SmartyError6);

	function RequestEntityTooLargeError() {
		_classCallCheck(this, RequestEntityTooLargeError);

		return _possibleConstructorReturn(this, (RequestEntityTooLargeError.__proto__ || Object.getPrototypeOf(RequestEntityTooLargeError)).call(this, "Request Entity Too Large: The request body has exceeded the maximum size."));
	}

	return RequestEntityTooLargeError;
}(SmartyError);

var BadRequestError = function (_SmartyError7) {
	_inherits(BadRequestError, _SmartyError7);

	function BadRequestError() {
		_classCallCheck(this, BadRequestError);

		return _possibleConstructorReturn(this, (BadRequestError.__proto__ || Object.getPrototypeOf(BadRequestError)).call(this, "Bad Request (Malformed Payload): A GET request lacked a street field or the request body of a POST request contained malformed JSON."));
	}

	return BadRequestError;
}(SmartyError);

var UnprocessableEntityError = function (_SmartyError8) {
	_inherits(UnprocessableEntityError, _SmartyError8);

	function UnprocessableEntityError(message) {
		_classCallCheck(this, UnprocessableEntityError);

		return _possibleConstructorReturn(this, (UnprocessableEntityError.__proto__ || Object.getPrototypeOf(UnprocessableEntityError)).call(this, message));
	}

	return UnprocessableEntityError;
}(SmartyError);

var TooManyRequestsError = function (_SmartyError9) {
	_inherits(TooManyRequestsError, _SmartyError9);

	function TooManyRequestsError() {
		_classCallCheck(this, TooManyRequestsError);

		return _possibleConstructorReturn(this, (TooManyRequestsError.__proto__ || Object.getPrototypeOf(TooManyRequestsError)).call(this, "When using the public 'website key' authentication, we restrict the number of requests coming from a given source over too short of a time."));
	}

	return TooManyRequestsError;
}(SmartyError);

var InternalServerError = function (_SmartyError10) {
	_inherits(InternalServerError, _SmartyError10);

	function InternalServerError() {
		_classCallCheck(this, InternalServerError);

		return _possibleConstructorReturn(this, (InternalServerError.__proto__ || Object.getPrototypeOf(InternalServerError)).call(this, "Internal Server Error."));
	}

	return InternalServerError;
}(SmartyError);

var ServiceUnavailableError = function (_SmartyError11) {
	_inherits(ServiceUnavailableError, _SmartyError11);

	function ServiceUnavailableError() {
		_classCallCheck(this, ServiceUnavailableError);

		return _possibleConstructorReturn(this, (ServiceUnavailableError.__proto__ || Object.getPrototypeOf(ServiceUnavailableError)).call(this, "Service Unavailable. Try again later."));
	}

	return ServiceUnavailableError;
}(SmartyError);

var GatewayTimeoutError = function (_SmartyError12) {
	_inherits(GatewayTimeoutError, _SmartyError12);

	function GatewayTimeoutError() {
		_classCallCheck(this, GatewayTimeoutError);

		return _possibleConstructorReturn(this, (GatewayTimeoutError.__proto__ || Object.getPrototypeOf(GatewayTimeoutError)).call(this, "The upstream data provider did not respond in a timely fashion and the request failed. A serious, yet rare occurrence indeed."));
	}

	return GatewayTimeoutError;
}(SmartyError);

module.exports = {
	BatchFullError: BatchFullError,
	BatchEmptyError: BatchEmptyError,
	UndefinedLookupError: UndefinedLookupError,
	BadCredentialsError: BadCredentialsError,
	PaymentRequiredError: PaymentRequiredError,
	RequestEntityTooLargeError: RequestEntityTooLargeError,
	BadRequestError: BadRequestError,
	UnprocessableEntityError: UnprocessableEntityError,
	TooManyRequestsError: TooManyRequestsError,
	InternalServerError: InternalServerError,
	ServiceUnavailableError: ServiceUnavailableError,
	GatewayTimeoutError: GatewayTimeoutError
};

},{}],49:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Response = require("./Response");
var Axios = require("axios-proxy-fix");
var axiosRetry = require("axios-retry");
var Promise = require("promise");

var HttpSender = function () {
	function HttpSender() {
		var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10000;
		var retries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
		var proxyConfig = arguments[2];
		var debug = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		_classCallCheck(this, HttpSender);

		axiosRetry(Axios, {
			retries: retries
		});
		this.timeout = timeout;
		this.proxyConfig = proxyConfig;
		if (debug) this.enableDebug();
	}

	_createClass(HttpSender, [{
		key: "buildRequestConfig",
		value: function buildRequestConfig(_ref) {
			var payload = _ref.payload,
			    parameters = _ref.parameters,
			    headers = _ref.headers,
			    baseUrl = _ref.baseUrl;

			var config = {
				method: "GET",
				timeout: this.timeout,
				params: parameters,
				headers: headers,
				baseURL: baseUrl,
				validateStatus: function validateStatus(status) {
					return status < 500;
				}
			};

			if (payload) {
				config.method = "POST";
				config.data = payload;
			}

			if (this.proxyConfig) config.proxy = this.proxyConfig;
			return config;
		}
	}, {
		key: "buildSmartyResponse",
		value: function buildSmartyResponse(response, error) {
			if (response) return new Response(response.status, response.data);
			return new Response(undefined, undefined, error);
		}
	}, {
		key: "send",
		value: function send(request) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				var requestConfig = _this.buildRequestConfig(request);

				Axios(requestConfig).then(function (response) {
					var smartyResponse = _this.buildSmartyResponse(response);

					if (smartyResponse.statusCode >= 400) reject(smartyResponse);

					resolve(smartyResponse);
				}).catch(function (error) {
					return reject(_this.buildSmartyResponse(undefined, error));
				});
			});
		}
	}, {
		key: "enableDebug",
		value: function enableDebug() {
			Axios.interceptors.request.use(function (request) {
				console.log('Request:\r\n', request);
				console.log('\r\n*******************************************\r\n');
				return request;
			});

			Axios.interceptors.response.use(function (response) {
				console.log('Response:\r\n');
				console.log('Status:', response.status, response.statusText);
				console.log('Headers:', response.headers);
				console.log('Data:', response.data);
				return response;
			});
		}
	}]);

	return HttpSender;
}();

module.exports = HttpSender;

},{"./Response":52,"axios-proxy-fix":4,"axios-retry":29,"promise":34}],50:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InputData = function () {
	function InputData(lookup) {
		_classCallCheck(this, InputData);

		this.lookup = lookup;
		this.data = {};
	}

	_createClass(InputData, [{
		key: "add",
		value: function add(apiField, lookupField) {
			if (this.lookupFieldIsPopulated(lookupField)) this.data[apiField] = this.lookup[lookupField];
		}
	}, {
		key: "lookupFieldIsPopulated",
		value: function lookupFieldIsPopulated(lookupField) {
			return this.lookup[lookupField] !== "" && this.lookup[lookupField] !== undefined;
		}
	}]);

	return InputData;
}();

module.exports = InputData;

},{}],51:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = function Request(payload) {
	_classCallCheck(this, Request);

	this.baseUrl = "";
	this.payload = payload;
	this.headers = {
		"Content-Type": "application/json; charset=utf-8"
	};

	this.parameters = {};
};

module.exports = Request;

},{}],52:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Response = function Response(statusCode, payload) {
	var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

	_classCallCheck(this, Response);

	this.statusCode = statusCode;
	this.payload = payload;
	this.error = error;
};

module.exports = Response;

},{}],53:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SharedCredentials = function () {
	function SharedCredentials(authId, hostName) {
		_classCallCheck(this, SharedCredentials);

		this.authId = authId;
		this.hostName = hostName;
	}

	_createClass(SharedCredentials, [{
		key: "sign",
		value: function sign(request) {
			request.parameters["auth-id"] = this.authId;
			if (this.hostName) request.headers["Referer"] = this.hostName;
		}
	}]);

	return SharedCredentials;
}();

module.exports = SharedCredentials;

},{}],54:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("promise");
var UnprocessableEntityError = require("./Errors").UnprocessableEntityError;
var SharedCredentials = require("./SharedCredentials");

var SigningSender = function () {
	function SigningSender(innerSender, signer) {
		_classCallCheck(this, SigningSender);

		this.signer = signer;
		this.sender = innerSender;
	}

	_createClass(SigningSender, [{
		key: "send",
		value: function send(request) {
			var _this = this;

			var sendingPostWithSharedCredentials = request.payload && this.signer instanceof SharedCredentials;
			if (sendingPostWithSharedCredentials) {
				var message = "Shared credentials cannot be used in batches with a length greater than 1 or when using the US Extract API.";
				throw new UnprocessableEntityError(message);
			}

			return new Promise(function (resolve, reject) {
				_this.signer.sign(request);
				_this.sender.send(request).then(resolve).catch(reject);
			});
		}
	}]);

	return SigningSender;
}();

module.exports = SigningSender;

},{"./Errors":48,"./SharedCredentials":53,"promise":34}],55:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StaticCredentials = function () {
	function StaticCredentials(authId, authToken) {
		_classCallCheck(this, StaticCredentials);

		this.authId = authId;
		this.authToken = authToken;
	}

	_createClass(StaticCredentials, [{
		key: "sign",
		value: function sign(request) {
			request.parameters["auth-id"] = this.authId;
			request.parameters["auth-token"] = this.authToken;
		}
	}]);

	return StaticCredentials;
}();

module.exports = StaticCredentials;

},{}],56:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("promise");
var Errors = require("./Errors");

var StatusCodeSender = function () {
	function StatusCodeSender(innerSender) {
		_classCallCheck(this, StatusCodeSender);

		this.sender = innerSender;
	}

	_createClass(StatusCodeSender, [{
		key: "send",
		value: function send(request) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				_this.sender.send(request).then(resolve).catch(function (error) {
					switch (error.statusCode) {
						case 400:
							error.error = new Errors.BadRequestError();
							break;

						case 401:
							error.error = new Errors.BadCredentialsError();
							break;

						case 402:
							error.error = new Errors.PaymentRequiredError();
							break;

						case 413:
							error.error = new Errors.RequestEntityTooLargeError();
							break;

						case 422:
							error.error = new Errors.UnprocessableEntityError("GET request lacked required fields.");
							break;

						case 429:
							error.error = new Errors.TooManyRequestsError();
							break;

						case 500:
							error.error = new Errors.InternalServerError();
							break;

						case 503:
							error.error = new Errors.ServiceUnavailableError();
							break;

						case 504:
							error.error = new Errors.GatewayTimeoutError();
							break;
					}

					reject(error);
				});
			});
		}
	}]);

	return StatusCodeSender;
}();

module.exports = StatusCodeSender;

},{"./Errors":48,"promise":34}],57:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A candidate is a possible match for an address that was submitted.<br>
 *     A lookup can have multiple candidates if the address was ambiguous.
 *
 * @see "https://smartystreets.com/docs/cloud/international-street-api#root"
 */
var Candidate = function Candidate(responseData) {
	_classCallCheck(this, Candidate);

	this.organization = responseData.organization;
	this.address1 = responseData.address1;
	this.address2 = responseData.address2;
	this.address3 = responseData.address3;
	this.address4 = responseData.address4;
	this.address5 = responseData.address5;
	this.address6 = responseData.address6;
	this.address7 = responseData.address7;
	this.address8 = responseData.address8;
	this.address9 = responseData.address9;
	this.address10 = responseData.address10;
	this.address11 = responseData.address11;
	this.address12 = responseData.address12;

	this.components = {};
	if (responseData.components !== undefined) {
		this.components.countryIso3 = responseData.components.country_iso_3;
		this.components.superAdministrativeArea = responseData.components.super_administrative_area;
		this.components.administrativeArea = responseData.components.administrative_area;
		this.components.subAdministrativeArea = responseData.components.sub_administrative_area;
		this.components.dependentLocality = responseData.components.dependent_locality;
		this.components.dependentLocalityName = responseData.components.dependent_locality_name;
		this.components.doubleDependentLocality = responseData.components.double_dependent_locality;
		this.components.locality = responseData.components.locality;
		this.components.postalCode = responseData.components.postal_code;
		this.components.postalCodeShort = responseData.components.postal_code_short;
		this.components.postalCodeExtra = responseData.components.postal_code_extra;
		this.components.premise = responseData.components.premise;
		this.components.premiseExtra = responseData.components.premise_extra;
		this.components.premisePrefixNumber = responseData.components.premise_prefix_number;
		this.components.premiseNumber = responseData.components.premise_number;
		this.components.premiseType = responseData.components.premise_type;
		this.components.thoroughfare = responseData.components.thoroughfare;
		this.components.thoroughfarePredirection = responseData.components.thoroughfare_predirection;
		this.components.thoroughfarePostdirection = responseData.components.thoroughfare_postdirection;
		this.components.thoroughfareName = responseData.components.thoroughfare_name;
		this.components.thoroughfareTrailingType = responseData.components.thoroughfare_trailing_type;
		this.components.thoroughfareType = responseData.components.thoroughfare_type;
		this.components.dependentThoroughfare = responseData.components.dependent_thoroughfare;
		this.components.dependentThoroughfarePredirection = responseData.components.dependent_thoroughfare_predirection;
		this.components.dependentThoroughfarePostdirection = responseData.components.dependent_thoroughfare_postdirection;
		this.components.dependentThoroughfareName = responseData.components.dependent_thoroughfare_name;
		this.components.dependentThoroughfareTrailingType = responseData.components.dependent_thoroughfare_trailing_type;
		this.components.dependentThoroughfareType = responseData.components.dependent_thoroughfare_type;
		this.components.building = responseData.components.building;
		this.components.buildingLeadingType = responseData.components.building_leading_type;
		this.components.buildingName = responseData.components.building_name;
		this.components.buildingTrailingType = responseData.components.building_trailing_type;
		this.components.subBuildingType = responseData.components.sub_building_type;
		this.components.subBuildingNumber = responseData.components.sub_building_number;
		this.components.subBuildingName = responseData.components.sub_building_name;
		this.components.subBuilding = responseData.components.sub_building;
		this.components.postBox = responseData.components.post_box;
		this.components.postBoxType = responseData.components.post_box_type;
		this.components.postBoxNumber = responseData.components.post_box_number;
	}

	this.analysis = {};
	if (responseData.analysis !== undefined) {
		this.analysis.verificationStatus = responseData.analysis.verification_status;
		this.analysis.addressPrecision = responseData.analysis.address_precision;
		this.analysis.maxAddressPrecision = responseData.analysis.max_address_precision;
	}

	this.metadata = {};
	if (responseData.metadata !== undefined) {
		this.metadata.latitude = responseData.metadata.latitude;
		this.metadata.longitude = responseData.metadata.longitude;
		this.metadata.geocodePrecision = responseData.metadata.geocode_precision;
		this.metadata.maxGeocodePrecision = responseData.metadata.max_geocode_precision;
		this.metadata.addressFormat = responseData.metadata.address_format;
	}
};

module.exports = Candidate;

},{}],58:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = require("../Request");
var Errors = require("../Errors");
var Candidate = require("./Candidate");
var Promise = require("promise");
var buildInputData = require("../util/buildInputData");
var keyTranslationFormat = require("../util/apiToSDKKeyMap").internationalStreet;

/**
 * This client sends lookups to the SmartyStreets International Street API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */

var Client = function () {
	function Client(sender) {
		_classCallCheck(this, Client);

		this.sender = sender;
	}

	_createClass(Client, [{
		key: "send",
		value: function send(lookup) {
			var _this = this;

			if (typeof lookup === "undefined") throw new Errors.UndefinedLookupError();

			var request = new Request();
			request.parameters = buildInputData(lookup, keyTranslationFormat);

			return new Promise(function (resolve, reject) {
				_this.sender.send(request).then(function (response) {
					if (response.error) reject(response.error);

					resolve(attachLookupCandidates(response, lookup));
				}).catch(reject);
			});

			function attachLookupCandidates(response, lookup) {
				response.payload.map(function (rawCandidate) {
					lookup.result.push(new Candidate(rawCandidate));
				});

				return lookup;
			}
		}
	}]);

	return Client;
}();

module.exports = Client;

},{"../Errors":48,"../Request":51,"../util/apiToSDKKeyMap":73,"../util/buildInputData":74,"./Candidate":57,"promise":34}],59:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UnprocessableEntityError = require("../Errors").UnprocessableEntityError;
var messages = {
	countryRequired: "Country field is required.",
	freeformOrAddress1Required: "Either freeform or address1 is required.",
	insufficientInformation: "Insufficient information: One or more required fields were not set on the lookup.",
	badGeocode: "Invalid input: geocode can only be set to 'true' (default is 'false'.",
	invalidLanguage: "Invalid input: language can only be set to 'latin' or 'native'. When not set, the the output language will match the language of the input values."
};

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     <p><b>Note: </b><i>Lookups must have certain required fields set with non-blank values. <br>
 *         These can be found at the URL below.</i></p>
 *     @see "https://smartystreets.com/docs/cloud/international-street-api#http-input-fields"
 */

var Lookup = function () {
	function Lookup(country, freeform) {
		_classCallCheck(this, Lookup);

		this.result = [];

		this.country = country;
		this.freeform = freeform;
		this.address1 = undefined;
		this.address2 = undefined;
		this.address3 = undefined;
		this.address4 = undefined;
		this.organization = undefined;
		this.locality = undefined;
		this.administrativeArea = undefined;
		this.postalCode = undefined;
		this.geocode = undefined;
		this.language = undefined;
		this.inputId = undefined;

		this.ensureEnoughInfo = this.ensureEnoughInfo.bind(this);
		this.ensureValidData = this.ensureValidData.bind(this);
	}

	_createClass(Lookup, [{
		key: "ensureEnoughInfo",
		value: function ensureEnoughInfo() {
			if (fieldIsMissing(this.country)) throw new UnprocessableEntityError(messages.countryRequired);

			if (fieldIsSet(this.freeform)) return true;

			if (fieldIsMissing(this.address1)) throw new UnprocessableEntityError(messages.freeformOrAddress1Required);

			if (fieldIsSet(this.postalCode)) return true;

			if (fieldIsMissing(this.locality) || fieldIsMissing(this.administrativeArea)) throw new UnprocessableEntityError(messages.insufficientInformation);

			return true;
		}
	}, {
		key: "ensureValidData",
		value: function ensureValidData() {
			var _this = this;

			var languageIsSetIncorrectly = function languageIsSetIncorrectly() {
				var isLanguage = function isLanguage(language) {
					return _this.language.toLowerCase() === language;
				};

				return fieldIsSet(_this.language) && !(isLanguage("latin") || isLanguage("native"));
			};

			var geocodeIsSetIncorrectly = function geocodeIsSetIncorrectly() {
				return fieldIsSet(_this.geocode) && _this.geocode.toLowerCase() !== "true";
			};

			if (geocodeIsSetIncorrectly()) throw new UnprocessableEntityError(messages.badGeocode);

			if (languageIsSetIncorrectly()) throw new UnprocessableEntityError(messages.invalidLanguage);

			return true;
		}
	}]);

	return Lookup;
}();

function fieldIsMissing(field) {
	if (!field) return true;

	var whitespaceCharacters = /\s/g;

	return field.replace(whitespaceCharacters, "").length < 1;
}

function fieldIsSet(field) {
	return !fieldIsMissing(field);
}

module.exports = Lookup;

},{"../Errors":48}],60:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Errors = require("../Errors");
var Request = require("../Request");
var Suggestion = require("./Suggestion");
var Promise = require("promise");

/**
 * This client sends lookups to the SmartyStreets US Autocomplete API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */

var Client = function () {
	function Client(sender) {
		_classCallCheck(this, Client);

		this.sender = sender;
	}

	_createClass(Client, [{
		key: "send",
		value: function send(lookup) {
			var _this = this;

			if (typeof lookup === "undefined") throw new Errors.UndefinedLookupError();

			var request = new Request();
			request.parameters = buildRequestParameters(lookup);

			return new Promise(function (resolve, reject) {
				_this.sender.send(request).then(function (response) {
					if (response.error) reject(response.error);

					lookup.result = buildSuggestionsFromResponse(response.payload);
					resolve(lookup);
				}).catch(reject);
			});

			function buildRequestParameters(lookup) {
				return {
					prefix: lookup.prefix,
					suggestions: lookup.maxSuggestions,
					city_filter: joinFieldWith(lookup.cityFilter, ","),
					state_filter: joinFieldWith(lookup.stateFilter, ","),
					prefer: joinFieldWith(lookup.prefer, ";"),
					prefer_ratio: lookup.preferRatio,
					geolocate: lookup.geolocate,
					geolocate_precision: lookup.geolocatePrecision
				};

				function joinFieldWith(field, delimiter) {
					if (field.length) return field.join(delimiter);
				}
			}

			function buildSuggestionsFromResponse(payload) {
				if (payload.suggestions === null) return [];

				return payload.suggestions.map(function (suggestion) {
					return new Suggestion(suggestion);
				});
			}
		}
	}]);

	return Client;
}();

module.exports = Client;

},{"../Errors":48,"../Request":51,"./Suggestion":62,"promise":34}],61:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-autocomplete-api#http-request-input-fields"
 */
var Lookup =
/**
 * @param prefix The beginning of an address. This is required to be set.
 */
function Lookup(prefix) {
	_classCallCheck(this, Lookup);

	this.result = [];

	this.prefix = prefix;
	this.maxSuggestions = undefined;
	this.cityFilter = [];
	this.stateFilter = [];
	this.prefer = [];
	this.preferRatio = undefined;
	this.geolocate = undefined;
	this.geolocatePrecision = undefined;
};

module.exports = Lookup;

},{}],62:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @see "https://smartystreets.com/docs/cloud/us-autocomplete-api#http-response"
 */
var Suggestion = function Suggestion(responseData) {
	_classCallCheck(this, Suggestion);

	this.text = responseData.text;
	this.streetLine = responseData.street_line;
	this.city = responseData.city;
	this.state = responseData.state;
};

module.exports = Suggestion;

},{}],63:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Candidate = require("../us_street/Candidate");

/**
 * @see <a href="https://smartystreets.com/docs/cloud/us-extract-api#http-response-status">SmartyStreets US Extract API docs</a>
 */

var Address = function Address(responseData) {
	_classCallCheck(this, Address);

	this.text = responseData.text;
	this.verified = responseData.verified;
	this.line = responseData.line;
	this.start = responseData.start;
	this.end = responseData.end;
	this.candidates = responseData.api_output.map(function (rawAddress) {
		return new Candidate(rawAddress);
	});
};

module.exports = Address;

},{"../us_street/Candidate":67}],64:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Errors = require("../Errors");
var Promise = require("promise");
var Request = require("../Request");
var Result = require("./Result");

/**
 * This client sends lookups to the SmartyStreets US Extract API, <br>
 *     and attaches the results to the Lookup objects.
 */

var Client = function () {
	function Client(sender) {
		_classCallCheck(this, Client);

		this.sender = sender;
	}

	_createClass(Client, [{
		key: "send",
		value: function send(lookup) {
			var _this = this;

			if (typeof lookup === "undefined") throw new Errors.UndefinedLookupError();

			var request = new Request(lookup.text);
			request.parameters = buildRequestParams(lookup);

			return new Promise(function (resolve, reject) {
				_this.sender.send(request).then(function (response) {
					if (response.error) reject(response.error);

					lookup.result = new Result(response.payload);
					resolve(lookup);
				}).catch(reject);
			});

			function buildRequestParams(lookup) {
				return {
					html: lookup.html,
					aggressive: lookup.aggressive,
					addr_line_breaks: lookup.addressesHaveLineBreaks,
					addr_per_line: lookup.addressesPerLine
				};
			}
		}
	}]);

	return Client;
}();

module.exports = Client;

},{"../Errors":48,"../Request":51,"./Result":66,"promise":34}],65:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-extract-api#http-request-input-fields"
 */
var Lookup =
/**
 * @param text The text that is to have addresses extracted out of it for verification (required)
 */
function Lookup(text) {
	_classCallCheck(this, Lookup);

	this.result = {
		meta: {},
		addresses: []
	};
	//TODO: require the text field.
	this.text = text;
	this.html = undefined;
	this.aggressive = undefined;
	this.addressesHaveLineBreaks = undefined;
	this.addressesPerLine = undefined;
};

module.exports = Lookup;

},{}],66:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Address = require("./Address");

/**
 * @see <a href="https://smartystreets.com/docs/cloud/us-extract-api#http-response-status">SmartyStreets US Extract API docs</a>
 */

var Result = function Result(_ref) {
	var meta = _ref.meta,
	    addresses = _ref.addresses;

	_classCallCheck(this, Result);

	this.meta = {
		lines: meta.lines,
		unicode: meta.unicode,
		addressCount: meta.address_count,
		verifiedCount: meta.verified_count,
		bytes: meta.bytes,
		characterCount: meta.character_count
	};

	this.addresses = addresses.map(function (rawAddress) {
		return new Address(rawAddress);
	});
};

module.exports = Result;

},{"./Address":63}],67:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A candidate is a possible match for an address that was submitted.<br>
 *     A lookup can have multiple candidates if the address was ambiguous, and<br>
 *     the maxCandidates field is set higher than 1.
 *
 * @see "https://smartystreets.com/docs/cloud/us-street-api#root"
 */
var Candidate = function Candidate(responseData) {
	_classCallCheck(this, Candidate);

	this.inputIndex = responseData.input_index;
	this.candidateIndex = responseData.candidate_index;
	this.addressee = responseData.addressee;
	this.deliveryLine1 = responseData.delivery_line_1;
	this.deliveryLine2 = responseData.delivery_line_2;
	this.lastLine = responseData.last_line;
	this.deliveryPointBarcode = responseData.delivery_point_barcode;

	this.components = {};
	if (responseData.components !== undefined) {
		this.components.urbanization = responseData.components.urbanization;
		this.components.primaryNumber = responseData.components.primary_number;
		this.components.streetName = responseData.components.street_name;
		this.components.streetPredirection = responseData.components.street_predirection;
		this.components.streetPostdirection = responseData.components.street_postdirection;
		this.components.streetSuffix = responseData.components.street_suffix;
		this.components.secondaryNumber = responseData.components.secondary_number;
		this.components.secondaryDesignator = responseData.components.secondary_designator;
		this.components.extraSecondaryNumber = responseData.components.extra_secondary_number;
		this.components.extraSecondaryDesignator = responseData.components.extra_secondary_designator;
		this.components.pmbDesignator = responseData.components.pmb_designator;
		this.components.pmbNumber = responseData.components.pmb_number;
		this.components.cityName = responseData.components.city_name;
		this.components.defaultCityName = responseData.components.default_city_name;
		this.components.state = responseData.components.state_abbreviation;
		this.components.zipCode = responseData.components.zipcode;
		this.components.plus4Code = responseData.components.plus4_code;
		this.components.deliveryPoint = responseData.components.delivery_point;
		this.components.deliveryPointCheckDigit = responseData.components.delivery_point_check_digit;
	}

	this.metadata = {};
	if (responseData.metadata !== undefined) {
		this.metadata.recordType = responseData.metadata.record_type;
		this.metadata.zipType = responseData.metadata.zip_type;
		this.metadata.countyFips = responseData.metadata.county_fips;
		this.metadata.countyName = responseData.metadata.county_name;
		this.metadata.carrierRoute = responseData.metadata.carrier_route;
		this.metadata.congressionalDistrict = responseData.metadata.congressional_district;
		this.metadata.buildingDefaultIndicator = responseData.metadata.building_default_indicator;
		this.metadata.rdi = responseData.metadata.rdi;
		this.metadata.elotSequence = responseData.metadata.elot_sequence;
		this.metadata.elotSort = responseData.metadata.elot_sort;
		this.metadata.latitude = responseData.metadata.latitude;
		this.metadata.longitude = responseData.metadata.longitude;
		this.metadata.precision = responseData.metadata.precision;
		this.metadata.timeZone = responseData.metadata.time_zone;
		this.metadata.utcOffset = responseData.metadata.utc_offset;
		this.metadata.obeysDst = responseData.metadata.dst;
	}

	this.analysis = {};
	if (responseData.analysis !== undefined) {
		this.analysis.dpvMatchCode = responseData.analysis.dpv_match_code;
		this.analysis.dpvFootnotes = responseData.analysis.dpv_footnotes;
		this.analysis.cmra = responseData.analysis.dpv_cmra;
		this.analysis.vacant = responseData.analysis.dpv_vacant;
		this.analysis.active = responseData.analysis.active;
		this.analysis.isEwsMatch = responseData.analysis.ews_match;
		this.analysis.footnotes = responseData.analysis.footnotes;
		this.analysis.lacsLinkCode = responseData.analysis.lacslink_code;
		this.analysis.lacsLinkIndicator = responseData.analysis.lacslink_indicator;
		this.analysis.isSuiteLinkMatch = responseData.analysis.suitelink_match;
	}
};

module.exports = Candidate;

},{}],68:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Candidate = require("./Candidate");
var Lookup = require("./Lookup");
var Batch = require("../Batch");
var UndefinedLookupError = require("../Errors").UndefinedLookupError;
var sendBatch = require("../util/sendBatch");
var keyTranslationFormat = require("../util/apiToSDKKeyMap").usStreet;

/**
 * This client sends lookups to the SmartyStreets US Street API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */

var Client = function () {
	function Client(sender) {
		_classCallCheck(this, Client);

		this.sender = sender;
	}

	/**
  * Sends up to 100 lookups for validation.
  * @param data May be a Lookup object, or a Batch which must contain between 1 and 100 Lookup objects
  * @throws SmartyException
  */


	_createClass(Client, [{
		key: "send",
		value: function send(data) {
			var dataIsBatch = data instanceof Batch;
			var dataIsLookup = data instanceof Lookup;

			if (!dataIsLookup && !dataIsBatch) throw new UndefinedLookupError();

			var batch = void 0;

			if (dataIsLookup) {
				batch = new Batch();
				batch.add(data);
			} else {
				batch = data;
			}

			return sendBatch(batch, this.sender, Candidate, keyTranslationFormat);
		}
	}]);

	return Client;
}();

module.exports = Client;

},{"../Batch":45,"../Errors":48,"../util/apiToSDKKeyMap":73,"../util/sendBatch":75,"./Candidate":67,"./Lookup":69}],69:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-street-api#input-fields"
 */
var Lookup = function Lookup(street, street2, secondary, city, state, zipCode, lastLine, addressee, urbanization, match, maxCandidates, inputId) {
	_classCallCheck(this, Lookup);

	this.street = street;
	this.street2 = street2;
	this.secondary = secondary;
	this.city = city;
	this.state = state;
	this.zipCode = zipCode;
	this.lastLine = lastLine;
	this.addressee = addressee;
	this.urbanization = urbanization;
	this.match = match;
	this.maxCandidates = maxCandidates;
	this.inputId = inputId;
	this.result = [];
};

module.exports = Lookup;

},{}],70:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lookup = require("./Lookup");
var Result = require("./Result");
var Batch = require("../Batch");
var UndefinedLookupError = require("../Errors").UndefinedLookupError;
var sendBatch = require("../util/sendBatch");
var keyTranslationFormat = require("../util/apiToSDKKeyMap").usZipcode;

/**
 * This client sends lookups to the SmartyStreets US ZIP Code API, <br>
 *     and attaches the results to the appropriate Lookup objects.
 */

var Client = function () {
	function Client(sender) {
		_classCallCheck(this, Client);

		this.sender = sender;
	}

	/**
  * Sends up to 100 lookups for validation.
  * @param data May be a Lookup object, or a Batch which must contain between 1 and 100 Lookup objects
  * @throws SmartyException
  */


	_createClass(Client, [{
		key: "send",
		value: function send(data) {
			var dataIsBatch = data instanceof Batch;
			var dataIsLookup = data instanceof Lookup;

			if (!dataIsLookup && !dataIsBatch) throw new UndefinedLookupError();

			var batch = void 0;

			if (dataIsLookup) {
				batch = new Batch();
				batch.add(data);
			} else batch = data;

			return sendBatch(batch, this.sender, Result, keyTranslationFormat);
		}
	}]);

	return Client;
}();

module.exports = Client;

},{"../Batch":45,"../Errors":48,"../util/apiToSDKKeyMap":73,"../util/sendBatch":75,"./Lookup":71,"./Result":72}],71:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * In addition to holding all of the input data for this lookup, this class also<br>
 *     will contain the result of the lookup after it comes back from the API.
 *     @see "https://smartystreets.com/docs/cloud/us-zipcode-api#http-request-input-fields"
 */
var Lookup = function Lookup(city, state, zipCode, inputId) {
	_classCallCheck(this, Lookup);

	this.city = city;
	this.state = state;
	this.zipCode = zipCode;
	this.inputId = inputId;
	this.result = [];
};

module.exports = Lookup;

},{}],72:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @see "https://smartystreets.com/docs/cloud/us-zipcode-api#root"
 */
var Result = function Result(responseData) {
	_classCallCheck(this, Result);

	this.inputIndex = responseData.input_index;
	this.status = responseData.status;
	this.reason = responseData.reason;
	this.valid = this.status === undefined && this.reason === undefined;

	this.cities = !responseData.city_states ? [] : responseData.city_states.map(function (city) {
		return {
			city: city.city,
			stateAbbreviation: city.state_abbreviation,
			state: city.state,
			mailableCity: city.mailable_city
		};
	});

	this.zipcodes = !responseData.zipcodes ? [] : responseData.zipcodes.map(function (zipcode) {
		return {
			zipcode: zipcode.zipcode,
			zipcodeType: zipcode.zipcode_type,
			defaultCity: zipcode.default_city,
			countyFips: zipcode.county_fips,
			countyName: zipcode.county_name,
			latitude: zipcode.latitude,
			longitude: zipcode.longitude,
			precision: zipcode.precision,
			stateAbbreviation: zipcode.state_abbreviation,
			state: zipcode.state,
			alternateCounties: !zipcode.alternate_counties ? [] : zipcode.alternate_counties.map(function (county) {
				return {
					countyFips: county.county_fips,
					countyName: county.county_name,
					stateAbbreviation: county.state_abbreviation,
					state: county.state
				};
			})
		};
	});
};

module.exports = Result;

},{}],73:[function(require,module,exports){
"use strict";

module.exports = {
	usStreet: {
		"street": "street",
		"street2": "street2",
		"secondary": "secondary",
		"city": "city",
		"state": "state",
		"zipcode": "zipCode",
		"lastline": "lastLine",
		"addressee": "addressee",
		"urbanization": "urbanization",
		"match": "match",
		"candidates": "maxCandidates"
	},
	usZipcode: {
		"city": "city",
		"state": "state",
		"zipcode": "zipCode"
	},
	internationalStreet: {
		"country": "country",
		"freeform": "freeform",
		"address1": "address1",
		"address2": "address2",
		"address3": "address3",
		"address4": "address4",
		"organization": "organization",
		"locality": "locality",
		"administrative_area": "administrativeArea",
		"postal_code": "postalCode",
		"geocode": "geocode",
		"language": "language"
	}
};

},{}],74:[function(require,module,exports){
"use strict";

var InputData = require("../InputData");

module.exports = function (lookup, keyTranslationFormat) {
	var inputData = new InputData(lookup);

	for (var key in keyTranslationFormat) {
		inputData.add(key, keyTranslationFormat[key]);
	}

	return inputData.data;
};

},{"../InputData":50}],75:[function(require,module,exports){
"use strict";

var Request = require("../Request");
var Promise = require("promise");
var Errors = require("../Errors");
var buildInputData = require("../util/buildInputData");

module.exports = function (batch, sender, Result, keyTranslationFormat) {
	if (batch.isEmpty()) throw new Errors.BatchEmptyError();

	var request = new Request();

	if (batch.length() === 1) request.parameters = generateRequestPayload(batch)[0];else request.payload = generateRequestPayload(batch);

	return new Promise(function (resolve, reject) {
		sender.send(request).then(function (response) {
			if (response.error) reject(response.error);

			resolve(assignResultsToLookups(batch, response));
		}).catch(reject);
	});

	function generateRequestPayload(batch) {
		return batch.lookups.map(function (lookup) {
			return buildInputData(lookup, keyTranslationFormat);
		});
	}

	function assignResultsToLookups(batch, response) {
		response.payload.map(function (rawResult) {
			var result = new Result(rawResult);
			var lookup = batch.getByIndex(result.inputIndex);

			lookup.result.push(result);
		});

		return batch;
	}
};

},{"../Errors":48,"../Request":51,"../util/buildInputData":74,"promise":34}]},{},[1])(1)
});
