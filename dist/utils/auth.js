"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatedClient = getAuthenticatedClient;
const google_auth_library_1 = require("google-auth-library");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const http = __importStar(require("http"));
const url_1 = require("url");
const server_destroy_1 = __importDefault(require("server-destroy"));
const TOKEN_PATH = path.join(__dirname, '../../token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
function getAuthenticatedClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google_auth_library_1.OAuth2Client(client_id, client_secret, redirect_uris[0]);
        if (fs.existsSync(TOKEN_PATH)) {
            const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
            oAuth2Client.setCredentials(token);
        }
        else {
            yield authorize(oAuth2Client);
        }
        oAuth2Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                console.log('Refresh token stored');
            }
        });
        return oAuth2Client;
    });
}
function authorize(oAuth2Client) {
    return __awaiter(this, void 0, void 0, function* () {
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
            prompt: 'consent',
        });
        console.log('Authorize this app by visiting this url:', authorizeUrl);
        const server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.includes('/oauth2callback')) {
                const qs = new url_1.URL(req.url, 'http://localhost:3000').searchParams;
                const code = qs.get('code');
                console.log(`Authorization code received: ${code}`);
                res.end('Authentication successful! You can close this window.');
                if (code) {
                    try {
                        const { tokens } = yield oAuth2Client.getToken(code);
                        console.log('Tokens acquired:', tokens);
                        oAuth2Client.setCredentials(tokens);
                        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                        console.log('Tokens stored in:', TOKEN_PATH);
                        // Now it's safe to destroy the server
                        server.destroy();
                    }
                    catch (error) {
                        console.error('Error retrieving access token:', error);
                    }
                }
            }
        })).listen(3000, () => {
            console.log('Server running at http://localhost:3000');
        });
        (0, server_destroy_1.default)(server);
    });
}
