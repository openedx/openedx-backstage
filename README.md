# [Backstage](https://backstage.io)

To start the app, run:

# Setup For Development

## One-time Setup
- Install nvm : https://github.com/nvm-sh/nvm#installing-and-updating
- Get Node 18: `nvm install 18`
    - This is not necessary if you already have Node 18 installed.
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
    corepack enable
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
yarn install --immutable
yarn tsc
yarn build:backend
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

Note that the following environment variables are set on Heroku via the application console. They can be viewed and edited from the settings tab or from the CLI.

AUTH_GITHUB_CLIENT_ID
AUTH_GITHUB_CLIENT_SECRET
GITHUB_TOKEN
PGSSLMODE
POSTGRES_DATABASE
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_PORT
POSTGRES_USER

The GitHub client id and secret are used to enable GitHub authentication.

The GitHub token is used for API calls.

If secrets and tokens expire, they will need to be regenerated in GitHub and updated in Heroku. Configuration changes will automatically cause the application to be released to take the updates. **The GitHub token is a personal token.**

PGSSLMODE is set to no-verify currently.  Another option would be to import the AWS certificate chain into Heroku.
