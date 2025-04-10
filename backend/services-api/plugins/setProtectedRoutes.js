import gameRoutes from '../routes/game/player-data.js';
import matchHistory from '../routes/game/match-history.js';
import fetchAllData from '../routes/frontend/fetchAllData.js';
import gameSettings from '../routes/frontend/gameSettings.js';

async function setProtectedRoutes(fastify, options){
    fastify.addHook('onRequest', async (request, reply) => {
        try{
            await request.jwtVerify();
        }catch(err){
            return reply.status(403).send("Forbidden");
        }
    });
    fastify.register(gameRoutes, {prefix : '/game'});
    fastify.register(matchHistory, {prefix : '/game'});
    fastify.register(gameSettings, {prefix : '/game'});
    fastify.register(fetchAllData, {prefix : '/frontend'});
}

export default setProtectedRoutes;