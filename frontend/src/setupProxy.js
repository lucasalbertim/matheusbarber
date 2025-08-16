const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy apenas para rotas da API
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api do caminho
      },
    })
  );
  
  // Proxy para rotas específicas do backend (sem /api)
  app.use(
    ['/clients', '/admins', '/services', '/attendances', '/whatsapp'],
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
};