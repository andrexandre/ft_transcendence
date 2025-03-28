export async function setPayload(token) {
    const data = await this.jwt.decode(token);
    const payload = {
        username: data.username,
        userId: data.userId,
    };
    return payload;
}