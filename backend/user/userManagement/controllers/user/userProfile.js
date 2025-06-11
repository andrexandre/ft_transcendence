
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
			console.log({statusCode: 500, message: "Internal server error", error: err});
        return;
    }
}

export { profile };