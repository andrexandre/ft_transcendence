//Core Plugins
import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyOAuth from '@fastify/oauth2';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import crypto from 'crypto';
import dotenv from 'dotenv';

//plugins
import setProtectedRoutes from './plugins/setProtectedRoutes.js';

//Decorators
import { generateToken, prepareTokenData } from './decorators/login/prepareToken.js';
import { parseToReadableData } from './decorators/login/prepareData.js';
import { parseToReadableOAuth } from './decorators/google/prepareGoogleAuthData.js';

//Routes
import registerRoutes from './routes/auth/register.js';
import loginRoutes from './routes/auth/login.js';
import logoutRoute from './routes/auth/logout.js';
import callbackOAuthRoute from './routes/auth/OAuth/callbackOAuth.js';
import jwtHandler from './routes/auth/jwt/jwtHandler.js'
import twoFactorAuth from './routes/auth/two-factor-auth.js'
import fs from 'fs';


dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fastify = Fastify({
  logger: {
    level: 'debug',
    timestamp: true, 
  },
  https: {
    key: fs.readFileSync('/ssl/server.key'),
    cert: fs.readFileSync('/ssl/server.crt'),
  }
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
  callbackUri: 'https://127.0.0.1:7000/callback',
});

fastify.decorate('prepareTokenData', prepareTokenData);
fastify.decorate('generateToken', generateToken);
fastify.decorate('parseToReadableData', parseToReadableData);
fastify.decorate('parseToReadableOAuth', parseToReadableOAuth);

fastify.register(setProtectedRoutes);
fastify.register(twoFactorAuth);
fastify.register(registerRoutes);
fastify.register(loginRoutes);
fastify.register(logoutRoute);
fastify.register(callbackOAuthRoute);
fastify.register(jwtHandler);

const JWT_SECRET_KEY = crypto.randomBytes(64).toString('hex');

fastify.register(fastifyJwt, {
  secret: JWT_SECRET_KEY,
  cookie: {
    cookieName: 'token',
    signed: false
  }
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
