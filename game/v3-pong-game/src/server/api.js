function setupAPIRoutes(app) {
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Pong Game Service!' });
    });
  
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', uptime: process.uptime() });
    });
  }
  
  module.exports = { setupAPIRoutes };
  