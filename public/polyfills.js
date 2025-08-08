// Polyfills for older mobile browsers
(function() {
  'use strict';
  
  // Promise polyfill for very old browsers
  if (typeof Promise === 'undefined') {
    window.Promise = function(executor) {
      var self = this;
      self.state = 'pending';
      self.value = undefined;
      self.handlers = [];
      
      function resolve(result) {
        if (self.state === 'pending') {
          self.state = 'fulfilled';
          self.value = result;
          self.handlers.forEach(handle);
          self.handlers = null;
        }
      }
      
      function reject(error) {
        if (self.state === 'pending') {
          self.state = 'rejected';
          self.value = error;
          self.handlers.forEach(handle);
          self.handlers = null;
        }
      }
      
      function handle(handler) {
        if (self.state === 'pending') {
          self.handlers.push(handler);
        } else {
          if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
            handler.onFulfilled(self.value);
          }
          if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
            handler.onRejected(self.value);
          }
        }
      }
      
      this.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
          handle({
            onFulfilled: function(result) {
              try {
                resolve(onFulfilled ? onFulfilled(result) : result);
              } catch (ex) {
                reject(ex);
              }
            },
            onRejected: function(error) {
              try {
                resolve(onRejected ? onRejected(error) : error);
              } catch (ex) {
                reject(ex);
              }
            }
          });
        });
      };
      
      try {
        executor(resolve, reject);
      } catch (ex) {
        reject(ex);
      }
    };
  }
  
  // Fetch polyfill for older browsers
  if (typeof fetch === 'undefined') {
    window.fetch = function(url, options) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        options = options || {};
        
        xhr.open(options.method || 'GET', url);
        
        if (options.headers) {
          for (var key in options.headers) {
            xhr.setRequestHeader(key, options.headers[key]);
          }
        }
        
        xhr.onload = function() {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            text: function() {
              return Promise.resolve(xhr.responseText);
            },
            json: function() {
              return Promise.resolve(JSON.parse(xhr.responseText));
            }
          });
        };
        
        xhr.onerror = function() {
          reject(new Error('Network error'));
        };
        
        xhr.send(options.body || null);
      });
    };
  }
  
  // Array.from polyfill
  if (!Array.from) {
    Array.from = function(arrayLike) {
      var result = [];
      for (var i = 0; i < arrayLike.length; i++) {
        result.push(arrayLike[i]);
      }
      return result;
    };
  }
  
  // Object.assign polyfill
  if (!Object.assign) {
    Object.assign = function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  }
  
  // String.includes polyfill
  if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }
      
      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }
  
  // Array.includes polyfill
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement) {
      return this.indexOf(searchElement) !== -1;
    };
  }
  
  // requestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 16);
    };
  }
  
  // classList polyfill for older browsers
  if (!('classList' in document.createElement('_'))) {
    (function(view) {
      if (!('Element' in view)) return;
      
      var classListProp = 'classList',
          protoProp = 'prototype',
          elemCtrProto = view.Element[protoProp],
          objCtr = Object,
          strTrim = String[protoProp].trim || function() {
            return this.replace(/^\s+|\s+$/g, '');
          },
          arrIndexOf = Array[protoProp].indexOf || function(item) {
            var i = 0, len = this.length;
            for (; i < len; i++) {
              if (i in this && this[i] === item) {
                return i;
              }
            }
            return -1;
          };
      
      var DOMTokenList = function(el) {
        this.el = el;
        var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
        for (var i = 0; i < classes.length; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function() {
          el.className = this.toString();
        };
      };
      
      DOMTokenList[protoProp] = [];
      DOMTokenList[protoProp].item = function(i) {
        return this[i] || null;
      };
      DOMTokenList[protoProp].contains = function(token) {
        token += '';
        return arrIndexOf.call(this, token) !== -1;
      };
      DOMTokenList[protoProp].add = function() {
        var tokens = arguments;
        for (var i = 0, l = tokens.length; i < l; i++) {
          var token = tokens[i] + '';
          if (arrIndexOf.call(this, token) === -1) {
            this.push(token);
          }
        }
        this._updateClassName();
      };
      DOMTokenList[protoProp].remove = function() {
        var tokens = arguments;
        for (var i = 0, l = tokens.length; i < l; i++) {
          var token = tokens[i] + '';
          var index = arrIndexOf.call(this, token);
          if (index !== -1) {
            this.splice(index, 1);
          }
        }
        this._updateClassName();
      };
      DOMTokenList[protoProp].toggle = function(token, force) {
        token += '';
        var result = this.contains(token),
            method = result ? force !== true && 'remove' : force !== false && 'add';
        if (method) {
          this[method](token);
        }
        if (force === true || force === false) {
          return force;
        } else {
          return !result;
        }
      };
      DOMTokenList[protoProp].toString = function() {
        return this.join(' ');
      };
      
      if (objCtr.defineProperty) {
        var defineProperty = function(object, name, definition) {
          if (definition.get) {
            object.__defineGetter__(name, definition.get);
          }
        };
        try {
          defineProperty(elemCtrProto, classListProp, {
            get: function() {
              return new DOMTokenList(this);
            }
          });
        } catch (ex) {
          // Fallback for older browsers
        }
      }
    }(window));
  }
  
  console.log('Polyfills loaded for older browser compatibility');
})();
