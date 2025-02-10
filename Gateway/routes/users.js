const userSchema = require('../schemas/userSchema');
const {db} = require('../app');

async function userRoutes(fastify, options) {
  fastify.post('/users', (request, reply) => {
    const { name, email } = request.body;

    const reponseQuery = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
    reponseQuery.run(name, email, function (err) {
      if (err) {
        return reply.status(500).send({ error: 'Error inserting data' });
      }
      reply.status(201).send({
        message: 'User created successfully',
        userId: this.lastID,
      });
    });
    reponseQuery.finalize();
  });

  fastify.get('/users', (request, reply) => {
    const { name, email } = request.query;
    console.log(email);
    db.all(`SELECT * FROM users WHERE name LIKE "${name}"`, [], (err, rows) => {
      if(err){
        reply.status(500).send({error : 'Error fetching data'});
        return;
      }
      reply.send(rows);
    })
  });
}

module.exports = userRoutes;