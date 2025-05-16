import bcrypt from 'bcrypt';

async function login(request, response) {

    const { username, password } = request.body;
    let resContent;
    try {
        const user = await this.getUserByUsername(username);
        if (!user)
            throw this.httpErrors.notFound('User not found!');
        else if (user.auth_method === 'google')
            throw this.httpErrors.forbidden('Can only sign with google!');
        
        const login = await bcrypt.compare(password, user.password);
        if (login != true) 
            throw this.httpErrors.unauthorized('Wrong password!');

        await this.updateUserStatus(user.username); // temporario

        resContent = {
            userId: `${user.id}`,
            username: `${user.username}`
        };

    } catch(err) {
        (err.statusCode) ? 
        response.status(err.statusCode).send(err) : response.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in authenticate the user!'});
    }

    response.status(200).send(resContent);
}

export default login;