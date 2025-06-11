import speakeasy, { totp } from 'speakeasy';
import qrcode from 'qrcode';


export default async function generateQrCode(fastify, options) {
  fastify.get('/set-google-authenticator',{
	schema: {
	   querystring: {
		 properties: {
		   status: { type: 'boolean', default: false }
		 },	
	   }
   }
 } ,async (request, reply) => {
    console.log("Request received from frontend");
	const two_FA_status = request.query.status;
	if (two_FA_status) {
		const secret = speakeasy.generateSecret();
		var url = speakeasy.otpauthURL({ secret: secret.base32, label: 'ft_transcendence', issuer: '2FAManager', encoding: 'base32' });
		const data_url = await qrcode.toDataURL(url);
		sendSecretToUserService(secret.base32, request.cookies.token, true);
		return reply.status(200).send(JSON.stringify({ content: `${data_url}` }));
	} else {
		sendSecretToUserService(null, request.cookies.token, true);
		return reply.status(200).send("2FA sucefully deactivated!");
	}
  });
}

export async function verifyGoogleAuthenticator(fastify, options) {
  fastify.post('/verify-google-authenticator',{
	schema: {
	   querystring: {
		 properties: {
		   isSetup: { type: 'string', default: 'false' }
		 },	
	   }
   }
 } ,async (req, res) => {
    const { totpCode, username } = req.body;
	const isSetup = req.query.isSetup === 'true';
    const bSecret = await fetchTwoFactorAuthData(username);
    const verified = speakeasy.totp.verify({
      secret: bSecret.secret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });
    if (verified) {
		if (isSetup) {
		  const cookieToken = req.cookies.token;
		  const payload = {
			two_FA_secret: bSecret.secret,
			two_FA_status: true,
			isSetup: true
		  };
		  const response = await fetch('https://nginx-gateway:80/api/users/save-2fa-settings', {
			method: 'PUT',
			headers: {
			  'Content-Type': 'application/json',
			  "Cookie": `token=${cookieToken}`,
			},
			credentials: "include",
			body: JSON.stringify(payload),
		  });
		  console.log('Response from user service:', response.status);
	  }
      return res.status(200).send('Token is valid');
    } else {
      return res.status(401).send('Token is invalid');
    }
  });
}

export async function fetchTwoFactorAuthData(username) {
  const response = await fetch(`https://nginx-gateway:80/api/users/${username}/two-fa-secret`);
  if (response.ok)
    return (await response.json());
}

async function sendSecretToUserService(secret, cookieToken, is_setup) {
  const payload = {
    two_FA_secret: secret,
    two_FA_status: false,
    isSetup: is_setup
  };
  const response = await fetch('https://nginx-gateway:80/api/users/save-2fa-settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      "Cookie": `token=${cookieToken}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  }