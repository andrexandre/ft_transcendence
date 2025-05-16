import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';// Função que gera um username aleatório

function generateUsername(maxLength = 15) {
	const raw = faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, '');
	const suffix = Math.floor(1000 + Math.random() * 9000).toString();
	const namePart = raw.slice(0, maxLength - suffix.length);
	return `${namePart}${suffix}`;
}

async function googleSign(request, response) {
    
    const { username, email, auth_method } = request.body;	
    try {
        
        let user = await this.getUserByEmail(email);
        if (!user) {
            // criar o user
			const newUsername = generateUsername();
            
			await this.createUser(newUsername, email, null, auth_method);
            user = await this.getUserByUsername(newUsername);
            response.status(201).send({
                userId: `${user.id}`,
                username: `${user.username}`,
            });
            return;
        } 
        
        response.status(200).send({
            userId: `${user.id}`,
            username: `${user.username}`,
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