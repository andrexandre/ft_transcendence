const fp = require('fastify-plugin');

async function tokenGenerator(fastify, options) {
    fastify.decorate('generateToken', (user) => {
        return fastify.jwt.sign({ username : user.username}, {expiresIn: '1h'});
    });
}

module.exports = fp(tokenGenerator);