# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn dev
```

# Prerequisities

At this time I am using:

nvm: 0.39.1 to manage node environments
node: 14.19.2
npm: 8.10.0
yarn: 1.22.18

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
docker push registry.heroku.com/open-edx-backstage/web
heroku container:release web -a open-edx-backstage
```

In case of any issues you can see the logs like so.

```sh
heroku logs --tail
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
