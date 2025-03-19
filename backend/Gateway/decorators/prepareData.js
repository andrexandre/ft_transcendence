export async function setPayload(token, method) {
    const data = await this.jwt.decode(token);
    const payload = {
        username: data.username,
        userId: data.userId,
        auth_method: method,
    };
    return payload;
}