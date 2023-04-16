import { setFfmpegPath } from "fluent-ffmpeg";
import { app } from "@electron/remote";
import { extname, join } from "path";

// I'd like to use process.resourcesPath which points to the resources folder
// if we're in a built process, but in a dev environment it points to
// node_modules/electron/... which is not what we want.
// app.getAppPath() points to the asar  file in a built process,
// and the project root in a dev environment.

let path = app.getAppPath();
console.log("App path is ", path);

let ext = extname(path);
if (ext === ".asar") {
  path = join(path, "..");
}

path = join(path, "/assets/ffmpeg.exe");
console.log("Setting ffmpeg path to", path);
setFfmpegPath(path);
