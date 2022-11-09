# [Backstage](https://backstage.io)

To start the app, run:

# Setup For Development

## One-time Setup
- Install nvm : https://github.com/nvm-sh/nvm#installing-and-updating
- Get Node 16: `nvm install 16`
    - This is not necessary if you already have Node 16 installed.
- Install Yarn: `npm install --global yarn`
- Ask a maintainer for access to the dev/prod credentials.
    - If you need to create/re-create the creds there's a how-to in the docs repo.


## Everytime You Develop

1. Export the various auth settings you need to run backstage locally.
    ```
    export AUTH_GITHUB_CLIENT_APP_ID=...
    export AUTH_GITHUB_CLIENT_ID=Iv1....
    export AUTH_GITHUB_CLIENT_SECRET=<new secret>
    export AUTH_GITHUB_CLIENT_PRIVATE_KEY=...
    ```

2. Start up the dev server
    ```sh
    yarn install
    yarn dev
    ```

# Deploying to Heroku

Backstage is deployed to Heroku as a Docker container which requires
building an image locally and pushing it to the Heroku container
registry.

The Heroku deployed version of backstage is connecting to a remote
PostgreSQL database. The details are specificed in app-config.yaml,
but the literal values are not injected until runtime and are passed
in as environment variables. Heroku allows environment variables to be
managed either via the console or via the CLI.

This assumes you have the heroku CLI installed and have sucessfully
authenticated.

```sh
yarn install
yarn tsc
yarn build
docker image build . -f packages/backend/Dockerfile --tag registry.heroku.com/openedx-backstage/web --pull
heroku login
heroku container:login
docker push registry.heroku.com/openedx-backstage/web
heroku container:release web -a openedx-backstage
```

In case of any issues you can see the logs like so.

```sh
heroku logs --tail -a openedx-backstage
```
