const {db} = require('../../app');

async function registerRoutes(fastify, options) {
    fastify.post('/register', (request, reply) => {
        const { username, email, password } = request.body;
        console.log(request.body);
        const registerQuery = db.prepare(`INSERT INTO users ("username", "email") VALUES (?, ?);`)
        registerQuery.run( username, email, (err) => {
            if(err){
                return reply.status(500).send({Error : "Error sending credentials"});
            }
            reply.status(201).send({Success : "User created successfully"});
        });
        registerQuery.finalize();
    });
}
module.exports = registerRoutes;