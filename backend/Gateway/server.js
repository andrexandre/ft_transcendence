//Core Plugins
import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyOAuth from '@fastify/oauth2';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

//Decorators
import { generateToken, prepareTokenData, verifyToken } from './decorators/prepareToken.js';
import { setPayload } from './decorators/prepareData.js';

//Routes
import registerRoutes from './routes/auth/register.js';
import loginRoutes from './routes/auth/login.js';
import logoutRoute from './routes/auth/logout.js';
import gameRoutes from './routes/game/player-data.js';
import matchHistory from './routes/game/match-history.js';
import callbackOAuthRoute from './routes/auth/OAuth/callbackOAuth.js';

dotenv.config();
const fastify = Fastify({
  logger: {
    level: 'debug',
    timestamp: true, 
  },
});

fastify.register(fastifyCookie);

fastify.register(fastifyOAuth, {
  name: 'google',
  scope: ['profile', 'email'],
  credentials: {
    client: {
      id: process.env.GOOGLE_ID,
      secret: process.env.GOOGLE_SECRET
    },
    auth: fastifyOAuth.GOOGLE_CONFIGURATION
  },
  startRedirectPath: '/loginOAuth',
  callbackUri: 'http://127.0.0.1:7000/callback',
});

fastify.decorate('prepareTokenData', prepareTokenData);
fastify.decorate('generateToken', generateToken);
fastify.decorate('verifyToken', verifyToken);
fastify.decorate('setPayload', setPayload);

fastify.register(registerRoutes);
fastify.register(loginRoutes);
fastify.register(gameRoutes);
fastify.register(matchHistory);
fastify.register(logoutRoute);
fastify.register(callbackOAuthRoute);

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

fastify.ready().then(() => {
  console.log('Registered Routes:', fastify.printRoutes());
});

// Start the server
fastify.listen({ port: 7000, host: '0.0.0.0' }, (err) => {
  if(err){
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('🚀 Server running at http://localhost:7000');
});
