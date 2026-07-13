const https = require('https');

const url = "https://7artisans.store/cdn/shop/files/1_9a398dbc-8564-4118-90c3-d96012864bad.jpg?v=1779179185";

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Length:', res.headers['content-length']);
}).on('error', (e) => {
  console.error(e);
});
