import * as React from "react";
import "../../styles.css";
import { User } from "@auth0/auth0-spa-js";
import { Button, Persona, Text } from "@fluentui/react-components";
import { login, logout, getUser, isAuthenticated } from "../../helpers/auth0client";
import { UnauthenticatedCard } from "./UnauthCard";
import { PictureSnip } from "./PictureSnip";
import { PdfSnip } from "./PdfSnip";

interface AppProps {
  title: string;
}
const App: React.FC<AppProps> = (props: AppProps) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuth, setIsAuth] = React.useState<boolean>(false);
  const [currentView, setCurrentView] = React.useState<string>("main");

  const checkAuth = async () => {
    const auth = await isAuthenticated();
    setIsAuth(auth);
    if (auth) {
      const userInfo = await getUser();
      setUser(userInfo);
      console.log(userInfo);
    }
  };

  React.useEffect(() => {
    checkAuth();

    // Read the current view from document settings
    Office.context.document.settings.refreshAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const view = Office.context.document.settings.get("currentView");
        if (view) {
          setCurrentView(view);
        }
      }
    });

    // Add event listener for settings changes
    Office.context.document.settings.addHandlerAsync(Office.EventType.SettingsChanged, () => {
      const view = Office.context.document.settings.get("currentView");
      console.log("Settings changed to:", view);
      if (view) {
        setCurrentView(view);
      }
    });
  }, []);

  const renderView = () => {
    switch (currentView) {
      case "pictureSnip":
        return <PictureSnip />;
      case "pdfViewer":
        return <PdfSnip />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[100vh] max-h-[100vh] overflow-hidden w-full max-w-full">
      {isAuth ? (
        <div className="flex flex-col items-center justify-start w-full h-full">
          <div className="w-full flex items-center justify-between p-2">
            <Persona name={user?.name} textAlignment="center" />
            <Button
              onClick={() => {
                logout({ openUrl: false }).then(() => {
                  checkAuth();
                });
              }}
            >
              Log Out
            </Button>
          </div>
          <div className="w-full flex-grow overflow-auto p-1">{renderView()}</div>
        </div>
      ) : (
        <UnauthenticatedCard
          login={() => {
            login(
              (arg) => {
                console.log(arg);
              },
              (arg) => {
                console.log(arg);
              },
              () => {
                console.log("Success");
                checkAuth();
              }
            );
          }}
          signup={() => {}}
        />
      )}
    </div>
  );
};

export default App;
