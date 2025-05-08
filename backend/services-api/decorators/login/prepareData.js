export async function parseToReadableData(token) {
    const data = await this.jwt.decode(token);
    const payload = {
        username: data.username,
        userId: data.userId,
        auth_method: data.auth_method,
    };
    return payload;
}