export async function generateToken(fastify, username, userId){
    const payload = {username, userId};
    try{
        const token = fastify.jwt.sign(payload, {expiresIn: '1h'});
        console.log(token);
    } catch(err){
        console.log(err);
    }
}