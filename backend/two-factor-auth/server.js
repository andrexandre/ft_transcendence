import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import dotenv from 'dotenv';
import fs from 'fs';
import googleAuthRoutes from './google-auth-app-routes/google-app-routes.js';
import { verifyGoogleAuthenticator } from './google-auth-app-routes/google-app-routes.js';

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