import speakeasy, { totp } from 'speakeasy';
import qrcode from 'qrcode';

const secret = speakeasy.generateSecret();

console.log('Secret:', secret.base32);
export default async function generateQrCode(fastify, options) {
  fastify.get('/set-google-authenticator', {
     schema: {
        querystring: {
          properties: {
            isSetup: { type: 'string', default: 'false' }
          },	
        }
    }
  },async (request, reply) => {
    console.log("Request received from frontend");
    var url = speakeasy.otpauthURL({ secret: secret.base32, label: 'ft_transcendence', issuer: '2FAManager', encoding: 'base32' });
    const data_url = await qrcode.toDataURL(url);
    const isSetup = request.query.isSetup === 'true';
    sendSecretToUserService(secret.base32, request.cookies.token, isSetup);
    return reply.status(200).send(JSON.stringify({ content: `${data_url}` }));
  });
}

export async function verifyGoogleAuthenticator(fastify, options) {
  fastify.post('/verify-google-authenticator', async (req, res) => {
    const { totpCode, username } = req.body;
    const bSecret = await fetchTwoFactorAuthData(username);
    const verified = speakeasy.totp.verify({
      secret: bSecret.secret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });
    if (verified) {
      const cookieToken = req.cookies.token;
      const payload = {
        two_FA_secret: "1",
        two_FA_status: true,
        isSetup: false
      };
      const response = await fetch('http://user_management:3000/api/users/save-2fa-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Cookie": `token=${cookieToken}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      console.log('Response from user service:', response.status);
      return res.status(200).send('Token is valid');
    } else {
      return res.status(401).send('Token is invalid');
    }
  });
}

export async function fetchTwoFactorAuthData(username) {
  const response = await fetch(`http://user_management:3000/api/users/${username}/two-fa-secret`);
  if (response.ok)
    return (await response.json());
}

async function sendSecretToUserService(secret, cookieToken, is_setup) {
  const payload = {
    two_FA_secret: secret,
    two_FA_status: false,
    isSetup: is_setup
  };
  const response = await fetch('http://user_management:3000/api/users/save-2fa-settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      "Cookie": `token=${cookieToken}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
}