import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

/* ADDED BASED ON Multiple Pages */
import {
  GitHubEntityProvider, // ADDED BASED ON https://backstage.io/docs/integrations/github/discovery
  GitHubOrgEntityProvider, // ADDED BASED ON https://backstage.io/docs/integrations/github/org
} from '@backstage/plugin-catalog-backend-module-github';
/* END ADDITION */

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  /* ADDED BASED ON https://backstage.io/docs/integrations/github/discovery
   *
   * This is for pulling in repos from any org that is defined in the
   * `catalog/providers/github` list that have a catalog-info.yaml.
   */
  builder.addEntityProvider(
    GitHubEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 60 },
        timeout: { minutes: 15 },
      }),
    }),
  );
  /* END ADDITION */

  /* ADDED BASED ON https://backstage.io/docs/integrations/github/org
   *
   * This will map backstage User and Group entities to match the users and
   * groups in our github org.
   */

  // The org URL below needs to match a configured integrations.github entry
  // specified in your app-config.
  builder.addEntityProvider(
    GitHubOrgEntityProvider.fromConfig(env.config, {
      id: 'production',
      orgUrl: 'https://github.com/openedx',
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 120 },
        timeout: { minutes: 15 },
      }),
    }),
  );
  /* END ADDITION */


  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
