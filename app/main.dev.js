/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, Menu, Tray } from "electron";
import { autoUpdater } from "electron-updater";
// const { dialog, autoUpdater } = require("electron");
import log from "electron-log";
import MenuBuilder from "./menu";

// document.on("click", 'a[href^="https://whaleex.zendesk.com"]', function(
//   event
// ) {
//   event.preventDefault();
//   shell.openExternal(this.href);
//   console.log(1111);
// });

// const webview = document.getElementById('foo')
// webview.addEventListener('new-window', (e) => {
//     // const protocol = require('url').parse(e.url).protocol;
//     // if (protocol === 'http:' || protocol === 'https:') {
//     //     webview.src = e.url;
//     // }
// });

export default class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();

    console.log("333");

    autoUpdater.on("checking-for-update", () => {
      console.log("autoUpdater");
      sendStatusToWindow("Checking for update...");
    });
    autoUpdater.on("update-not-available", () => {
      console.log("no update");
    });
  }
}

// const server = "https://hazel.17621412757.now.sh";
// const feed = `${server}/update/${process.platform}/${app.getVersion()}`;
// console.log(11111111, feed);
//

let mainWindow = null;

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }

  // tray = new Tray('resources/icon.ico');
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Item1', type: 'radio' },
  //   { label: 'Item2', type: 'radio' },
  //   { label: 'Item3', type: 'radio', checked: true },
  //   { label: 'Item4', type: 'radio' }
  // ]);
  // tray.setToolTip('This is my application.');
  // tray.setContextMenu(contextMenu);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1380,
    height: 670,
    minWidth: 1200,
    minHeight: 670,
    backgroundColor: "#80FFFFFF",
    title: "鲸交所"
  });
  mainWindow.on("page-title-updated", function(event) {
    event.preventDefault();
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on("closed", () => {
    console.log(111);
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});
