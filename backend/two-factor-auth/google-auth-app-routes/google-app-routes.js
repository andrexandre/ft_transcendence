import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const secret = speakeasy.generateSecret();

console.log('Secret:', secret.base32);
export default async function generateQrCode(fastify, options) {
    fastify.get('/set-google-authenticator', async (request, reply) => {
    console.log("Request received from frontend");
    var url = speakeasy.otpauthURL({ secret: secret.base32, label: 'ft_transcendence', issuer: '2FAManager' ,encoding: 'base32' });
    const data_url = await qrcode.toDataURL(url);
    return reply.send(`<img src="${data_url}" alt="QR Code"> ${secret.base32}`);
  });
}

export async function verifyGoogleAuthenticator(fastify, options) {
  fastify.post('/verify-google-authenticator', async (req, res) => {
    const token = req.body.token;
    const Bsecret = req.body.secret;
    console.log('Token:', token);
    console.log('Secret:', secret);
    const verified = speakeasy.totp.verify({
        secret: Bsecret,
        encoding: 'base32',
        token: token,
        window: 1
    });
    if (verified) {
        return res.status(200).send('Token is valid');
    } else {
        return res.status(401).send('Token is invalid');
    }
  });
}

export async function fetchTwoFactorAuthData(fastify, options){
  fastify.post('/fetch-2fa-data', async (req, res) => {
    const code = req.body.code;
    //const secret = fetch(http://user_management:3000/get-secret);
    //implement the fetch function to get the secret from the user management service
    //implement logic to verify the code with the secret
  });
}

function sendSecretToUserService(secret) {
  // Implement the logic to send the secret to the user management service
}