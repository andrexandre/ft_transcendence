import * as loginControllers from '../controllers/auth/login.js';
import { loginSchema, tokenInfoSchema } from '../schemas/auth/loginSchema.js';
import googleSign from '../controllers/auth/googleSign.js';
import googleSignSchema from "../schemas/auth/googleSignSchema.js";

async function authRoutes(server, opts) {
    
	server.route({ method: 'POST', url: '/api/login', schema: loginSchema, handler: loginControllers.login });
    server.route({ method: 'POST', url: '/api/login/googleSign', schema: googleSignSchema, handler: googleSign });
    server.route({ method: 'GET', url: '/api/tokenInfo', schema: tokenInfoSchema, handler: loginControllers.tokenInfo });
}

export default authRoutes;