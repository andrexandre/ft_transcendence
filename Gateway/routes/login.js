const loginSchema = require('../schemas/loginSchema');
const {db} = require('../app');
const validateToken = require('../plugins/validateToken');

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
      if(rows.length == 0){
        reply.status(404).send({Error : "No user found!"});
        return;
      }
      reply.status(200).send(rows);
    }).catch((err) => {
      reply.status(500).send({ error: 'Database query error', details: err.message });
      return;
    });
  });
}
module.exports = loginRoutes;