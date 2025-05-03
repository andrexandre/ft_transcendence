import { randomUUID } from 'crypto';

async function googleSign(request, response) {
    
    const { username, email, auth_method } = request.body;
    try {
        
        let user = await this.getUserByUsername(username); // Procurar pelo email
        if (!user) {
            // criar o user
            await this.createUser(username, email, null, auth_method);
            user = await this.getUserByUsername(username);
            response.status(201).send({
                userID: `${user.id}`,
                username: `${user.username}`,
                message: "User created!"
            });
            return;
        } 
        
        response.status(200).send({
            userID: `${user.id}`,
            username: `${user.username}`,
            message: "User already exist!"
        });
        return;
        
    } catch(err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            const msg = (err.message.includes("email")) ? 'Email' : 'Username'; // true
            response.status(409).send({statusCode: 409, error: "Conflict", message: `${msg} already exist!`});
        } else {
            response.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in creating user!'});
        } 
    }
}

export default googleSign;