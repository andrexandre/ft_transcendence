
async function profile(request, reply) {
			
    try {
        const { username } = request.params;
        const user = await this.getUserByUsername(username);
        if (!user)
            throw this.httpErrors.notFound('User not found!');;
        return reply.send({
            username: user.username,
            email: user.email,
            codename: user.codename,
            biography: user.biography
        });
    } catch(err) {
        if (err.statusCode)
			reply.status(err.statusCode).send(err);
		else
			reply.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error fetching resources!'});
        return;
    }
}

export { profile };