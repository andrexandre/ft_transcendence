export async function prepareTokenData(requestData, auth_method) {
    const data = await requestData.json();
    const username = data.username;
    const userId = data.userId;
    const payload = {username, userId, auth_method};
    return payload;
}

export async function generateToken(payload){
    try{
        const token = this.jwt.sign(payload, {expiresIn: '1h'});
        return token;
    } catch(err){
        console.log(err);
    }
}