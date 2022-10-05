const bff = require('./bff/bff');
const idp = require('./oidc-provider');

const start = (app, port) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(server);
      }
    });
  });

const runExample = (name) => {
  const app = require('./bff/bff');
  return start(app, 3000);
};


start(bff, 3000);
start(idp, 3001);
