const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Exemple d'une fonction où tu souhaites afficher un stream
const displayStream = (app) => {
  // Applique le proxy middleware à la route spécifique
  app.use(
    '/stream', // Chemin d'API à proxyfier
    createProxyMiddleware({
      target: 'http://raspberry.local:8000', // Cible du proxy
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
    })
  );
};

module.exports = { displayStream };
