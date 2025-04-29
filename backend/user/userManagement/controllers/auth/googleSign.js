
async function googleSign(request, response) {
    
    const { username, email, auth_method } = request.body;
    let resContent;
    try {
        
        let user = await this.getUserByUsername(username);
        if (!user) {
            // criar o user
            await this.createUser(username, email, null, auth_method);
            user = await this.getUserByUsername(username);
            resContent = {
                userID: `${user.id}`,
                username: `${user.username}`,
                message: "User created"
            };
            response.status(201).send(resContent);
        } 
        
        resContent = {
            userID: `${user.id}`,
            username: `${user.username}`,
            message: "User already exist"
        };
        response.status(200).send(resContent);
        
    } catch(err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            const msg = (err.message.includes("email")) ? 'Email' : 'Username'; // true
            response.status(409).send({message: `${msg} already exist!`});
        } else {
            response.status(500).send({message: `${err}`});
        } 
    }

}

export default googleSign;