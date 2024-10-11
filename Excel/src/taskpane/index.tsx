import * as React from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import App from "./components/App";
import { getAuth0Client } from "../helpers/auth0Client";

/* global document, Office, module, require */

const title = "ProSights";

let isOfficeInitialized = false;

const render = (Component) => {
  const rootElement = document.getElementById("container");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <FluentProvider theme={webLightTheme}>
        <Component title={title} isOfficeInitialized={isOfficeInitialized} />
      </FluentProvider>
    );
  }
};

/* Initialize application */
Office.onReady(() => {
  Office.addin.setStartupBehavior(Office.StartupBehavior.load);
  Office.context.document.settings.set("Office.AutoShowTaskpaneWithDocument", true);
  Office.context.document.settings.saveAsync();

  isOfficeInitialized = true;
  render(App);
});

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    render(NextApp);
  });
}

function showTaskpaneAndUpdateView(view: string, event: Office.AddinCommands.Event) {
  console.log("Showing taskpane and updating view", view);
  Office.addin
    .showAsTaskpane()
    .then(() => {
      Office.context.document.settings.set("currentView", view);
      return Office.context.document.settings.saveAsync();
    })
    .then(() => {
      event.completed();
    })
    .catch((error) => {
      console.error(error);
      event.completed();
    });
}

function showPictureSnip(event: Office.AddinCommands.Event) {
  showTaskpaneAndUpdateView("pictureSnip", event);
  console.log("Showing picture snip");
}

function showPDFViewer(event: Office.AddinCommands.Event) {
  showTaskpaneAndUpdateView("pdfViewer", event);
}

function showMain(event: Office.AddinCommands.Event) {
  showTaskpaneAndUpdateView("main", event);
  console.log("Showing main");
}

Office.actions.associate("showMain", showMain);
Office.actions.associate("showPictureSnip", showPictureSnip);
Office.actions.associate("showPDFViewer", showPDFViewer);

// The add-in command functions need to be available in global scope
// @ts-ignore
globalThis.showPictureSnip = showPictureSnip;
// @ts-ignore
globalThis.showPDFViewer = showPDFViewer;
// @ts-ignore
globalThis.showMain = showMain;
