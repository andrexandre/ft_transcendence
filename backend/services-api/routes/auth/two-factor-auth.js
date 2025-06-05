function twoFactorAuth(fastify, options) {
    fastify.post('/login/two-factor-auth', async (request, reply) => {
        const { username, password } = request.body;
        const payload = {
            username: username,
            password: password
        };
        const response = await fetch('http://two-factor-auth:3500/verify-google-authenticator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if(response.ok)
            reply.status(200).send(data);
    });
}

export default twoFactorAuth;