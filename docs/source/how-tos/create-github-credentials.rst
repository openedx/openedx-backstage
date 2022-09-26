How to Create GitHub Credentials
################################

This how-to will walk you through the process of creating a github app in the
right org and get all the credentials you need to be able to run the app.  The
process is the same for development or production.

You can look at the relevant backstage docs here: https://backstage.io/docs/integrations/github/github-apps

1. In the org you want to connect to, make a new github app.

   eg. In ``openedx`` go to
   https://github.com/organizations/openedx/settings/apps and hit the
   :guilabel:`New GitHub App` button.

2. Fill out the form as follows:

   * GitHub App name: Give your installation a unique name. eg. ``Backstage
     [Local/Production] Open edX``

   * Homepage URL: The homepage for the UI. eg.
     ``https://backstage.openedx.org`` or ``https://localhost:3000``

   * Callback URL: The callback url for auth purposes.  eg.
     ``https://backstage.openedx.org/api/auth/github/handler/frame`` or
     ``http://localhost:7007/api/auth/github``

   * Webhook: Disable the webhook capability by unchecking the
     :guilabel:`Active` checkbox.

   * Repository Permissions (More details about why in the backstage docs linked
     above.)

      * ``Contents``: ``Read-only``

      * ``Members``: ``Read-only``

3. Click :guilabel:`Create GitHub App`

4. Click :guilabel:`Create a new client secret` and save the generated secret.

5. Click :guilabel:`Generate a private key` and save the generated key.

6. Go to :guilabel:`Install App` and install the newly created app on your org.


Once you've gone through these steps you should have everything you need to
start up the app.  See the readme for how to pass these credentials to backstage
at startup.

For convenience, consider saving the follwing information in one file in your
password manager:

* App ID: The numeric ID of your app.

* Client ID: Starts with ``Iv1``

* Client Secret: That you generated above.

* privateKey: The contents of the private key file.
