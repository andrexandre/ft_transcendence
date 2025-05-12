import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import dotenv from 'dotenv';
import googleAuthRoutes from './google-auth-app-routes/google-app-routes.js';
import { verifyGoogleAuthenticator } from './google-auth-app-routes/google-app-routes.js';

dotenv.config();

const fastify = Fastify({
    logger: {
      level: 'debug',
      timestamp: true, 
    },
  });

fastify.register(googleAuthRoutes, { prefix: '/2fa' });
fastify.register(verifyGoogleAuthenticator, { prefix: '/2fa' });
fastify.register(fastifyCookie);

fastify.ready().then(() => {
  console.log('Registered Routes:', fastify.printRoutes());
});

fastify.listen({port : 3500, host : '0.0.0.0'}, (err) => {
    if(err){
        fastify.log.error(err);
        process.exit(1);
    }
    console.log('Server is running on port 3500');
});