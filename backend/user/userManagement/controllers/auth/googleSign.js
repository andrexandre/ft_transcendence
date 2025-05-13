import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';// Função que gera um username aleatório

function generateUsername() {
	const name = faker.internet.username().toLowerCase();
	const suffix = Math.floor(1000 + Math.random() * 9000);
	return `${name}${suffix}`;
}

async function googleSign(request, response) {
    
    const { username, email, auth_method } = request.body;
    try {
        
        let user = await this.getUserByEmail(email); // Procurar pelo email
        if (!user) {
            // criar o user
			const newUsername = generateUsername();

			console.log('New Username: ', newUsername);
			console.log('Old Username: ', username);
            
			await this.createUser(newUsername, email, null, auth_method);
            user = await this.getUserByUsername(newUsername);
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