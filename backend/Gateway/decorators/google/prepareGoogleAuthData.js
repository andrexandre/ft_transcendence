export async function parseToReadableOAuth(token) {
    try{
        const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
        });    
        const data = await response.json();
        const payload = {
            username : data.name,
            email : data.email,
            auth_method : "google",
        }
        return payload;
    }catch(err){
        return err;
    }
}