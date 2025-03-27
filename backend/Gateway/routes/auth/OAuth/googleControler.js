async function googleControler(fastify, options) {
    fastify.get('/googleData', async (req, reply) => {
        const response = await fetch('http://gateway-api:7000/loginOAuth', {
            method: 'GET',
        });
        if(response.status === 200){
            //console.log("PAYLOAD : ", payload);
        }
        const token = req.cookies.token;
        const payload = await fastify.parseToReadableData(token);
        reply.status(200).send(payload);
    });
}

export default googleControler;