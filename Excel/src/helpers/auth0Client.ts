import { Auth0Client, LogoutOptions } from "@auth0/auth0-spa-js";
import { auth0Config } from "../auth0-config";

let auth0Client: Auth0Client | null = null;

export const getAuth0Client = (): Auth0Client => {
  if (!auth0Client) {
    auth0Client = new Auth0Client({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      cacheLocation: auth0Config.cacheLocation as "localstorage",
      authorizationParams: {
        redirect_uri: auth0Config.redirectUri,
      },
    });
  }
  return auth0Client;
};

export const login = async (
  onAuthRedirect: (arg: any) => void,
  onFail?: (arg: any) => void,
  onSuccess?: () => void
): Promise<void> => {
  const client = getAuth0Client();
  await client.loginWithRedirect({
    openUrl: async (url) => {
      Office.context.ui.displayDialogAsync(url, (asyncResult) => {
        const dialog: Office.Dialog = asyncResult.value;
        dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (arg: any) => {
          dialog.close();
          onAuthRedirect(arg);

          if (arg.error && onFail) {
            onFail(arg);
          }

          try {
            await client.handleRedirectCallback(arg.message);
            onSuccess && onSuccess();
          } catch (e) {
            onFail && onFail(e);
          }
        });
      });
    },
  });
};

export const logout = async (options?: LogoutOptions): Promise<void> => {
  const client = getAuth0Client();
  await client.logout(options);
};

export const getUser = async () => {
  const client = getAuth0Client();
  return await client.getUser();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const client = getAuth0Client();
  return await client.isAuthenticated();
};
