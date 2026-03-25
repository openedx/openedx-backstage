import { SignInPage } from '@backstage/core-components';
import { githubAuthApiRef } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';

export const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () =>
      function GithubSignInPage(props) {
        return (
          <SignInPage
            {...props}
            auto
            provider={{
              id: 'github-auth-provider',
              title: 'GitHub',
              message: 'You must be a member of the "openedx" github org.',
              apiRef: githubAuthApiRef,
            }}
          />
        );
      },
  },
});
