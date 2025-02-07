const userSchema = require('../schemas/userSchema');
const fastifyJwt = require('@fastify/jwt');

module.exports = async function (fastify, options) {
  fastify.get('/users', async (request, reply) => {
    return {message : "Ola"};
  });

  fastify.post('/users' , {
    schema: {
      body: userSchema
    }
  }, async(request, reply) => {
      const {name, pass} = request.body;
      return {message : `User ${name}, pass ${pass}`}
  });
};