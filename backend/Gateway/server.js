import Fastify from 'fastify'
import { generateToken, prepareTokenData, verifyToken } from './decorators/prepareToken.js';
import { setPayload } from './decorators/prepareData.js';
import registerRoutes from './routes/auth/register.js';
import loginRoutes from './routes/auth/login.js';
import logoutRoute from './routes/auth/logout.js';
import gameData from './routes/game/player-data.js';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

dotenv.config();
const fastify = Fastify({
  logger: {
    level: 'debug',
    timestamp: true, 
  },
});

fastify.decorate('prepareTokenData', prepareTokenData);
fastify.decorate('generateToken', generateToken);
fastify.decorate('verifyToken', verifyToken);
fastify.decorate('setPayload', setPayload);

fastify.register(registerRoutes);
fastify.register(loginRoutes);
fastify.register(gameData);
fastify.register(fastifyCookie);
fastify.register(logoutRoute);
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET_KEY,
  cookie: {
    cookieName: 'token',
    signed: false
  }
});

fastify.register(cors, {
  origin: ['http://127.0.0.1:5500', 'http://pongify:5000'], // Allow frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Allow cookies if needed
});

// Start the server
fastify.listen({ port: 7000, host: '0.0.0.0' }, (err) => {
  if(err){
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('🚀 Server running at http://localhost:7000');
});
