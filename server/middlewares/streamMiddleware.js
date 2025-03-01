const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const displayStream = async (req, res) => {
  createProxyMiddleware({
    target: '',
    changeOrigin: true,
    router: (req) => "http://raspberry.local:8000/stream",
    onProxyRes: (proxyRes, req, res) => {
      let cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        cookies = cookies.map(cookie => {
          // Ajoute SameSite=Lax si non défini, vous pouvez choisir 'Strict' ou 'None; Secure' selon vos besoins
          if (!/;\s*SameSite=/i.test(cookie)) {
            return cookie + '; SameSite=Lax';
          }
          return cookie;
        });
        proxyRes.headers['set-cookie'] = cookies;
      }
      proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    onError: (err, req, res) => {
      console.error('Erreur lors du proxy:', err);
      res.status(500).send('Erreur lors du streaming');
    }
  });
}
module.exports = {  displayStream };
