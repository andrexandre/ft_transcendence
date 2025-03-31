import gameRoutes from '../routes/game/player-data.js';
import matchHistory from '../routes/game/match-history.js';

async function setProtectedRoutes(fastify, options){
    fastify.addHook('onRequest', fastify.verifyToken);
    fastify.register(gameRoutes);
    fastify.register(matchHistory);
}

export default setProtectedRoutes;