import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { GitHubOrgEntityProvider,
         GithubDiscoveryProcessor,
         GithubOrgReaderProcessor,
       } from '@backstage/plugin-catalog-backend-module-github';

// GitHub Discovery: https://backstage.io/docs/integrations/github/discovery
// import {
//   GithubDiscoveryProcessor,
//   GithubOrgReaderProcessor,
// } from '@backstage/plugin-catalog-backend-module-github';
import {
  ScmIntegrations,
  DefaultGithubCredentialsProvider
} from '@backstage/integration';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  // The org URL below needs to match a configured integrations.github entry
  // specified in your app-config.
  builder.addEntityProvider(
    GitHubOrgEntityProvider.fromConfig(env.config, {
      id: 'production',
      orgUrl: 'https://github.com/openedx',
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 60 },
        timeout: { minutes: 15 },
      }),
    }),
  );

  builder.addProcessor(new ScaffolderEntitiesProcessor());

  const integrations = ScmIntegrations.fromConfig(env.config);
  const githubCredentialsProvider =
    DefaultGithubCredentialsProvider.fromIntegrations(integrations);
  builder.addProcessor(
    GithubDiscoveryProcessor.fromConfig(env.config, {
      logger: env.logger,
      githubCredentialsProvider,
    }),
    GithubOrgReaderProcessor.fromConfig(env.config, {
      logger: env.logger,
      githubCredentialsProvider,
    }),
  );

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
