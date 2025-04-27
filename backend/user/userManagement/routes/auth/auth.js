import login from '../../controllers/auth/login.js';
import loginSchema from '../../schemas/auth/loginSchema.js';
import googleSign from '../../controllers/auth/googleSign.js';
import googleSignSchema from "../../schemas/auth/googleSignSchema.js";


async function authRoutes(server, opts) {
    
    server.route({ method: 'POST', url: '/api/login', schema: loginSchema, handler: login });
    server.route({ method: 'POST', url: '/api/login/googleSign', schema: googleSignSchema,	 handler: googleSign });
}

export default authRoutes;