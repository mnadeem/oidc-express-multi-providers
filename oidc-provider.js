const Provider = require('oidc-provider');
const jose = require('jose');

const config = {
  enabledJWA: {
    idTokenSigningAlgValues: ['ES256']
  },
  clients: [
    {
      client_id: 'test-express-openid-connect-client-id',
      id_token_signed_response_alg: 'ES256',
      client_secret: 'test-express-openid-connect-client-secret',
      token_endpoint_auth_method: 'client_secret_post',
      response_types: ['id_token', 'code', 'code id_token'],
      grant_types: ['implicit', 'authorization_code', 'refresh_token'],
      redirect_uris: [`http://localhost:3000/callback`],
      post_logout_redirect_uris: [
        'http://localhost:3000',
      ],
    }
  ],
  findAccount(ctx, id) {
    return {
      accountId: id,
      claims: () => ({ sub: id }),
    };
  },
  jwks: {
    keys: [jose.JWK.generateSync('EC').toJWK(true)],
  },
};

const PORT = process.env.PROVIDER_PORT || 3001;

const provider = new Provider(`http://localhost:${PORT}`, config);

// Monkey patch the provider to allow localhost and http redirect uris
const { invalidate: orig } = provider.Client.Schema.prototype;
provider.Client.Schema.prototype.invalidate = function invalidate(
  message,
  code
) {
  if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') {
    return;
  }
  orig.call(this, message);
};

module.exports = provider;
