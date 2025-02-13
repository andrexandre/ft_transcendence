const loginSchema = require('../schemas/loginSchema');
const {db} = require('../app');

async function loginRoutes(fastify, options) {
  fastify.post('/login', (request, reply) => {
      const { username, password } = request.body;

      return new Promise((resolve, reject) => {
        
        const loginQuery = `SELECT * FROM users WHERE username = "${username}"`;

        db.all(loginQuery, (err, rows) => {
          if(err){
            reject(err);
          }
          resolve(rows);
        });
      })
    .then((rows) => {
      reply.send(rows);
    }).catch((err) => {
      reply.status(500).send({ error: 'Database query error', details: err.message });
    });
  });
}
module.exports = loginRoutes;