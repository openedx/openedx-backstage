import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SidebarContent } from './Sidebar';
import { signInPage } from './SignIn';

export const navModule = createFrontendModule({
  pluginId: 'app',
  extensions: [SidebarContent, signInPage],
});
