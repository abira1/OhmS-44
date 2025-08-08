/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-ed523f2f'], (function (workbox) { 'use strict';

  importScripts("/firebase-messaging-sw.js");
  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  }, {
    "url": "assets/firebase-MPTq0Wbm.js",
    "revision": null
  }, {
    "url": "assets/index-By-8iWZX.css",
    "revision": null
  }, {
    "url": "assets/index-DJZY4_-d.js",
    "revision": null
  }, {
    "url": "assets/ui-eg1ujs3k.js",
    "revision": null
  }, {
    "url": "assets/useSmartRefresh-CSY72QDa.js",
    "revision": null
  }, {
    "url": "assets/vendor-EO9uhuCm.js",
    "revision": null
  }, {
    "url": "assets/web-C1sltTZQ.js",
    "revision": null
  }, {
    "url": "downloads/Readme.html",
    "revision": "2a1992789b0556c5fad5227e1d0880e8"
  }, {
    "url": "favicon.ico",
    "revision": "68b329da9893e34099c7d8ad5cb9c940"
  }, {
    "url": "firebase-messaging-sw.js",
    "revision": "d0e6706847b050595377ee2bbfb5bd0d"
  }, {
    "url": "generate-icons.html",
    "revision": "8f60a06f738de1ab1c09572a1176a1c4"
  }, {
    "url": "icon-192.png",
    "revision": "7a16231fb5309713cee0ad3e94a72aad"
  }, {
    "url": "icon-512.png",
    "revision": "cf7cda4427140eef3d724d7121af883d"
  }, {
    "url": "icon.svg",
    "revision": "36ecbd84a8cd4ff1aa03b04f9641a439"
  }, {
    "url": "index.html",
    "revision": "2e3a316bee046b46b983ac50213e315f"
  }, {
    "url": "offline.html",
    "revision": "fb9490c762a1ced803729ae78b378371"
  }, {
    "url": "polyfills.js",
    "revision": "f993eb746a7e103cc50c541da43b676f"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "screenshot-narrow.png",
    "revision": "27cab162fcaa2489600403a48b2d41c7"
  }, {
    "url": "screenshot-wide.png",
    "revision": "c99b9e0f6cb1f99ddd473606f55cbdda"
  }, {
    "url": "share.html",
    "revision": "a5a39acfc757e4106e40273e941cfe41"
  }, {
    "url": "sw.js",
    "revision": "717de5107b55f698273df62105a533e2"
  }, {
    "url": "test-cancellation.js",
    "revision": "3eaf22abf53eee8c6750b08f27d5856e"
  }, {
    "url": "favicon.ico",
    "revision": "68b329da9893e34099c7d8ad5cb9c940"
  }, {
    "url": "icon-192.png",
    "revision": "7a16231fb5309713cee0ad3e94a72aad"
  }, {
    "url": "icon-512.png",
    "revision": "cf7cda4427140eef3d724d7121af883d"
  }, {
    "url": "manifest.webmanifest",
    "revision": "77a59d88ba6e913f0178c441d51f878d"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/offline.html"), {
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/.*\.firebaseio\.com\/.*/i, new workbox.NetworkFirst({
    "cacheName": "firebase-data-cache",
    "networkTimeoutSeconds": 3,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 86400
    }), new workbox.BackgroundSyncPlugin("firebase-sync", {
      maxRetentionTime: 1440
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:png|jpg|jpeg|svg|gif|webp)$/, new workbox.CacheFirst({
    "cacheName": "images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');

}));
