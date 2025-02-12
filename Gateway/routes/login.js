const loginSchema = require('../schemas/loginSchema');
const {db} = require('../app');

async function loginRoutes(fastify, options) {
  fastify.post('/login', (request, reply) => {
    const { username, password } = request.body;

      const loginQuery = db.prepare(`SELECT EXISTS (SELECT username FROM users WHERE username = ?);`)
      loginQuery.run(username, (err) => {
        if (err) {
          return reply.status(500).send({ error: 'Error inserting data' });
        }
        reply.status(201).send({
          message: 'User loggedin successfully',
          userId: this.lastID,
        });
      });
      loginQuery.finalize();
    });
}
module.exports = loginRoutes;