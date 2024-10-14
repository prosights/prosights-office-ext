import * as React from "react";
import { DefaultButton } from "@fluentui/react";
import { User } from "@auth0/auth0-spa-js";
import { login, logout, getUser, isAuthenticated } from "../../helpers/auth0Client";
import PictureSnip from "./PictureSnip";
import PDFViewer from "./PDFViewer";

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

const App: React.FC<AppProps> = ({ title, isOfficeInitialized }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuth, setIsAuth] = React.useState<boolean>(false);
  const [currentView, setCurrentView] = React.useState<string>("main");

  const checkAuth = async () => {
    const auth = await isAuthenticated();
    setIsAuth(auth);
    if (auth) {
      const userInfo = await getUser();
      setUser(userInfo);
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

  if (!isOfficeInitialized) {
    return (
      <div>
        <h1>{title}</h1>
        <p>Please sideload your add-in to see app body.</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case "pictureSnip":
        return (
          <div
            style={{
              width: "100%",
              minHeight: "100vh",
              maxWidth: "100vw",
              overflowX: "hidden",
            }}
          >
            <DefaultButton onClick={() => setCurrentView("main")}>Home</DefaultButton>
            <PictureSnip />
          </div>
        );
      case "pdfViewer":
        return (
          <div
            style={{
              width: "100%",
              minHeight: "100vh",
              maxWidth: "100vw",
              overflowX: "hidden",
            }}
          >
            <DefaultButton onClick={() => setCurrentView("main")}>Home</DefaultButton>
            <PDFViewer />
          </div>
        );
      default:
        return (
          <div className="ms-welcome">
            <h1>{title}</h1>
            {isAuth ? (
              <>
                <p>Welcome, {user?.name}!</p>
                <DefaultButton
                  onClick={() =>
                    logout({ openUrl: false }).then(() => {
                      checkAuth();
                    })
                  }
                >
                  Log Out
                </DefaultButton>
              </>
            ) : (
              <DefaultButton
                onClick={() => {
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
              >
                Log In
              </DefaultButton>
            )}
          </div>
        );
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      {renderView()}
    </div>
  );
};

export default App;
