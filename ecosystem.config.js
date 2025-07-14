module.exports = {
  apps: [
    {
      name: 'shikshagraha-app',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: 'apps/shikshagraha-app',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'registration',
      script: 'node_modules/.bin/next',
      args: 'start -p 4300',
      cwd: 'mfes/registration',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'content',
      script: 'node_modules/.bin/next',
      args: 'start -p 4301',
      cwd: 'mfes/content',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'players',
      script: 'node_modules/.bin/next',
      args: 'start -p 4108',
      cwd: 'mfes/players',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
