import gameRoutes from '../routes/game/player-data.js';
import matchHistory from '../routes/game/match-history.js';
import fetchDashboardData from '../routes/frontend/fetchAllData.js';
import gameSettings from '../routes/frontend/gameSettings.js';

async function setProtectedRoutes(fastify, options) {
    fastify.addHook('onRequest', async (request, reply) => {
        try{
            await request.jwtVerify();
        } catch (err) {
            reply.status(403);
            return err;
        }
    });
    fastify.register(gameRoutes);
    fastify.register(matchHistory, {prefix : '/game'});
    fastify.register(gameSettings, {prefix : '/game'});
    fastify.register(fetchDashboardData, {prefix : '/frontend'});
}

export default setProtectedRoutes;