import fastify from ('fastify')({ logger: true });
import registerRoutes from ('./routes/auth/register');
import loginRoutes from ('./routes/auth/login');
import gameRoutes from ('./routes/game/player-data');
import cors from ('@fastify/cors');

fastify.register(registerRoutes);
fastify.register(loginRoutes);
fastify.register(gameRoutes);

fastify.register(cors, {
  origin: ['http://127.0.0.1:5500', 'http://pongify:5000'], // Allow frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Allow cookies if needed
});

// Define a basic route
fastify.get('/', async (request, reply) => {
  return { message: 'Hello, Fastify!' };
});

// Start the server
fastify.listen({ port: 7000, host: '0.0.0.0' }, () => {
  console.log('🚀 Server running at http://localhost:7000');
});
