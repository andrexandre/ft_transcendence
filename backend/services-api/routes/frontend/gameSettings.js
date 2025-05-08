function gameSettings(fastify, options){
    fastify.get('/game-settings', async (request, reply) => {
        const settings = await fetchSettings();
        reply.send(settings);
    });
}

async function fetchSettings() {
    const response = await fetch("http://127.0.0.1:5000/get-user-data", { credentials: "include" });
    const settingsData = await response.json();
    return settingsData;
}

export default gameSettings;