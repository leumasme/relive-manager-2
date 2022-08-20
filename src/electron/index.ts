import { app, BrowserWindow } from "electron";
import { join } from "path";
import { parse } from "url";

import * as remote from "@electron/remote/main";
remote.initialize();

import logger from "./utils/logger";

console.time("start-till-ready");

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;

logger.info("App starting...");

let mainWindow: BrowserWindow | null;

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

const createWindow = () => {
  console.timeEnd("start-till-ready");
  console.time("ready-till-show");
  mainWindow = new BrowserWindow({
    width: 1150,
    height: 680,
    minWidth: 700,
    minHeight: 450,
    webPreferences: {
      devTools: isProd ? false : true,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
    title: "Replay Manager",
    show: false,
  });
  mainWindow.removeMenu();

  const url = isProd
    ? // in production, use the statically build version of our application
    `file://${join(__dirname, "public", "index.html")}`
    : // in dev, target the host and port of the local rollup web server
    "http://localhost:5000";

  mainWindow.loadURL(url).catch((err) => {
    logger.error(JSON.stringify(err));
    app.quit();
  });

  if (!isProd) mainWindow.webContents.openDevTools();

  mainWindow.once("ready-to-show", () => {
    remote.enable(mainWindow!.webContents);
    console.timeEnd("ready-till-show");
    mainWindow!.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.on("ready", createWindow);

app.on("web-contents-created", (_evt, contents) => {
  // Security of webviews
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    logger.info("will-attach-webview", event, params);
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;
  });

  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedURL = parse(navigationUrl);
    // In dev mode allow Hot Module Replacement
    if (parsedURL.host !== "localhost:5000" && !isProd) {
      logger.warn("Stopped attempt to open: " + navigationUrl);
      event.preventDefault();
    } else if (isProd) {
      logger.warn("Stopped attempt to open: " + navigationUrl);
      event.preventDefault();
    }
  });
});
