import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

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
			
			const newUsername = generateUsername();

			await this.createUser(newUsername, email, null, auth_method);
            user = await this.getUserByUsername(newUsername);

			// Create the user in game db
			const responseGame = await fetch('http://nginx-gateway:80/game/init-user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({id: user.id, username: user.username})
			});

			if (!responseGame.ok) {
				console.log('User not created in game!');
				console.log('Error creating user in game: ', (await responseGame.json()));
			}

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
            const msg = (err.message.includes("email")) ? 'Email' : 'Username';
            response.status(409).send({statusCode: 409, error: "Conflict", message: `${msg} already exist!`});
        } else {
            response.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in creating user!'});
        } 
    }
}

export default googleSign;