import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export default async function generateQrCode(fastify, options) {
    const secret = speakeasy.generateSecret();
    fastify.get('/api/2fa', async (request, reply) => {
    const data_url = await qrcode.toDataURL(secret.otpauth_url);
    console.log('QR Code Data URL:', data_url);
    return reply
                .header('Content-Type', 'text/html')
                .send(`<html><body><h1>Scan the QR Code</h1><img src="${data_url}" alt="QR Code"></body></html>`)
  });
}