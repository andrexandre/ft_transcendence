const fastify = require('fastify')({ logger: true });

// Define a simple route
fastify.get('/', async (request, reply) => {
  return { message: 'Hello, Fastify!' };
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 7000, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:7000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
