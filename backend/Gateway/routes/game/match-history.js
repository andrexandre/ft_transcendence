function matchHistory(fastify, options) {
    fastify.post("/save-matchHistory", async (request, reply) => {

        const response = await fetch("http://pongify:5000/save-match", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request.body),
        });
        if (!response.ok) 
            return reply.status(500).send({ error: "Failed to save match history" });
        // const data = await response.json();
        // console.log("✅✅✅✅",data);

        reply.status(200).send({ message: "Match history saved successfully" });
    });
}

export default matchHistory;