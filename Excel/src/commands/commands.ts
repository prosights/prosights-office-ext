/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global Office */

Office.onReady(() => {
  // If needed, Office.js is ready to be called
});

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
