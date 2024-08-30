import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { URL } from 'url';
import destroyer from 'server-destroy';

const TOKEN_PATH = path.join('/home/j5on/.config/wsp/token.json');
const CREDENTIALS_PATH = path.join('/home/j5on/.config/wsp/credentials.json');

export async function getAuthenticatedClient(): Promise<OAuth2Client | null> {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } else {
    const authorized = await authorize(oAuth2Client);
    if (authorized) {
      return null; // Indicate that authorization was successful but the user needs to rerun the command
    }
    throw new Error("Authorization failed");
  }
}

async function authorize(oAuth2Client: OAuth2Client): Promise<boolean> {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });

  console.log('Authorize this app by visiting this url:', authorizeUrl);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url?.includes('/oauth2callback')) {
        const qs = new URL(req.url, 'http://localhost:3000').searchParams;
        const code = qs.get('code');
        console.log(`Authorization code received: ${code}`);
        res.end('Authentication successful! You can close this window and rerun the command.');

        if (code) {
          try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log('Tokens stored in:', TOKEN_PATH);
            server.destroy();
            resolve(true);
          } catch (error) {
            console.error('Error retrieving access token:', error);
            reject(error);
          }
        }
      }
    }).listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });

    destroyer(server);
  });
}
