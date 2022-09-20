# [Backstage](https://backstage.io)

To start the app, run:

# Setup For Development

## One-time Setup
- Install nvm : https://github.com/nvm-sh/nvm#installing-and-updating
- Get Node 16: `nvm install 16`
    - This is not necessary if you already have Node 16 installed.
- Install Yarn: `npm install --global yarn`

### Setup Github Tokens

You'll need both a github personal access token and a github app to fully run
this version of backstage.  By the end of this section, you should have the following
three environment variables set in your shell:

- `GITHUB_TOKEN`
- `AUTH_GITHUB_CLIENT_SECRET`
- `AUTH_GITHUB_CLIENT_ID`

#### Personal Token

You will need a new GitHub Personal Access Token with the following permissions:
- `repo`
- `user:email`
- `read:org`
- `read:discussion`

See https://backstage.io/docs/integrations/github/locations for why you need each of those.

1. Go to: https://github.com/settings/tokens
2. Create a new token with those scopes.
3. Save this token for use when you're developing.

#### GitHub App

1. Go to https://github.com/settings/apps
2. Create your own github app with the following settings:

    - Name: "\<your github handle\> Backstage Local"
    - Homepage URL: "http://localhost:3000"
    - Callback URL: "http://localhost:7007/api/auth/github"
    - Disable Webhook

3. Create the App

4. Then from the created app, `Generate a new client secret`

5. Save the client ID and client secret for use when you're developing.
## Everytime You Develop

1. Export the various auth settings you need to run backstage locally.
    ```
    export AUTH_GITHUB_CLIENT_SECRET=<new secret>
    export AUTH_GITHUB_CLIENT_ID=Iv1....
    export GITHUB_TOKEN=ghp_...
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
docker image build . -f packages/backend/Dockerfile --tag registry.heroku.com/open-edx-backstage/web
heroku login
heroku container:login
docker push registry.heroku.com/open-edx-backstage/web
heroku container:release web -a open-edx-backstage
```

In case of any issues you can see the logs like so.

```sh
heroku logs --tail -a open-edx-backstage
```
