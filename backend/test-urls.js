const https = require('https');
const urls = [
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1556909212-d5b604d7c525?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1620626011161-997c51447343?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80"
];

async function check() {
  for (const url of urls) {
    await new Promise((resolve) => {
      https.get(url, (res) => {
        console.log(`${res.statusCode} : ${url}`);
        resolve();
      }).on('error', (e) => {
        console.error(e);
        resolve();
      });
    });
  }
}
check();
