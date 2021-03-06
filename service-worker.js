
var CACHE_NAME = 'my-site-cache-v2';
var urlsToCache = [
    '/pwa',
    '/pwa/index.html',
    '/pwa/styles/main.css',
    '/pwa/scripts/main.js',
    '/pwa/scripts/app.js',
    '/pwa/images/smiley.svg',
    '/pwa/android-chrome-144x144.png',
    '/pwa/favicon.ico',
    '/pwa/scripts/app.js',
    'https://unpkg.com/vue',
    '/pwa/data/data.json',
    'https://code.jquery.com/jquery-3.2.1.min.js'
];
 

self.addEventListener('install', function (event) {

    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (resp) {
            return resp || fetch(event.request).then(function (response) {
                return caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});
self.addEventListener('push', function (event) {
    var title = 'Yay a message.';
    var body = event.data.text();
    var icon = '/images/smiley.svg';
    var tag = 'simple-push-example-tag';
    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon,
            tag: tag
        })
    );
});
self.addEventListener('pushsubscriptionchange', function(event) {
    console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    event.waitUntil(
      self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })
      .then(function(newSubscription) {
        // TODO: Send to application server
        console.log('[Service Worker] New subscription: ', newSubscription);
      })
    );
  });

function imgLoad(url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'blob';

        request.onload = function () {
            if (request.status == 200) {
                resolve(request.response);
            } else {
                reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
            }
        };

        request.onerror = function () {
            reject(Error('There was a network error.'));
        };

        request.send();
    });
}

//var body = document.querySelector('body');
//var myImage = new Image();

//imgLoad('myLittleVader.jpg').then(function (response) {
//    var imageURL = window.URL.createObjectURL(response);
//    myImage.src = imageURL;
//    body.appendChild(myImage);
//}, function (Error) {
//    console.log(Error);
//});