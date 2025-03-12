export async function prepareTokenData(requestData) {
    const data = await requestData.json();
    const username = data.username;
    const userId = data.userID;
    const payload = {username, userId};
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

export async function verifyToken(request){
    try{
        await request.jwtVerify();
    }catch(err){
        return err;
    }
}