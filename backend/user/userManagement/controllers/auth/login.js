import bcrypt from 'bcrypt';

async function tokenInfo(request, response) {
	const username = request.query.username;
	try {
        const user = await this.getUserByUsername(username);
        if (!user)
            throw this.httpErrors.notFound('User not found!');
        const resContent = {
            userId: user.id,
			username : user.username
        };
		return response.status(200).send(resContent);

    } catch(err) {
        (err.statusCode) ? 
        response.status(err.statusCode).send(err) : response.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in authenticate the user!'});
    }
}

async function login(request, response) {

    const { username, password } = request.body;
    let resContent;
    try {
        const user = await this.getUserByUsername(username);
        if (!user)
            throw this.httpErrors.notFound('User not found!');
        else if (user.auth_method === 'google')
            throw this.httpErrors.forbidden('Please sign in with google!');
        
        const login = await bcrypt.compare(password, user.password);
        if (login != true) 
            throw this.httpErrors.unauthorized('Wrong password!');

        resContent = {
            two_FA_status: user.two_FA_status,
        };

    } catch(err) {
        (err.statusCode) ? 
        response.status(err.statusCode).send(err) : response.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in authenticate the user!'});
    }

    response.status(200).send(resContent);
}

export { login, tokenInfo };