import { spawn } from "child_process";
import { parseDuration } from "./utils";

export function runFFmpegCommand(args: string[]): AsyncIterable<[string, string]> {
  let process = spawn("ffmpeg", args)

  let buffer: ([string, string] | null)[] = [];
  type ResolveFunc = (value: IteratorResult<[string, string], any> | PromiseLike<IteratorResult<[string, string], any>>) => void;
  let waiter: ResolveFunc | null = null;

  // On STDOUT, resolve if already waiting, otherwise push data to buffer
  function onMessage(source: string, msg: string) {
    console.log("[FFMPEG]", source, msg);
    if (waiter != null) {
      waiter({ value: [source, msg.toString()], done: false });
      waiter = null;
      return;
    }
    buffer.push([source, msg.toString()]);
  }

  process.stdout.on("data", (msg: Buffer) => {
    onMessage("stdout", msg.toString());
  });
  process.stderr.on("data", (msg: Buffer) => {
    onMessage("stderr", msg.toString());
  });

  // On Exit, resolve with done if already waiting, otherwise push null to buffer
  process.on("exit", () => {
    console.log("FFmpeg exited");
    if (waiter != null) {
      waiter({ value: undefined, done: true });
      waiter = null;
      return;
    }
    buffer.push(null);
  })

  return {
    [Symbol.asyncIterator]() {
      return {
        next: () => {
          return new Promise((resolve, reject) => {
            if (waiter != null) {
              // If already waiting, fail as we cant support multiple waiting at the same time
              reject(new Error("Async Iterator already in use"));
            } else if (buffer.length != 0) {
              // If we have data already stored up, we can resolve with that
              let val = buffer.shift();

              // typescript type checking isnt great here, thus separating the 2 possible resolves
              if (val == undefined) {
                resolve({ value: undefined, done: true });
              } else {
                resolve({ value: val, done: false });
              }
            } else {
              // No data is stored up, set to waiting and resolve in the process events
              waiter = resolve;
            }
          });
        }
      }
    }
  }
}

type FFmpegProgress = {
  current_size: number, bitrate: number, dropped_frames: number, duplicate_frames: number, processed_time: number, status: string, speed: number
};
function parseFFmpegProgress(input: string): FFmpegProgress {
  let entries: Record<string, string> = Object.fromEntries(
    input.split("\n").filter(l => l.trim().length > 0)
      .map(line => line.split("=").map(l => l.trim()))
  );
  return {
    current_size: parseInt(entries["total_size"]),
    bitrate: parseInt(entries["bitrate"].replace("kbit/s", "")),
    dropped_frames: parseInt(entries["drop_frames"]),
    duplicate_frames: parseInt(entries["dup_frames"]),
    processed_time: parseInt(entries["out_time_us"]) / 1000 / 1000,
    status: entries["progress"], // "continue" | "end" ?
    speed: parseInt(entries["speed"].replace("x", "")),
  }
}

export type Progress = {
  progress: number, speed: number, total: number,
  progressPercent: number, eta: number
};
export async function* extractAudio(from: string, to: string) {
  let output = runFFmpegCommand([
    "-i", from, "-q:a", "0", "-map", "a", to, "-y", "-progress", "pipe:1"
  ]);
  // let startTime = Date.now();
  let duration: number | null = null;
  for await (let update of output) {
    if (update[0] == "stdout") {
      let data = parseFFmpegProgress(update[1])
      yield {
        progress: data.processed_time, speed: data.speed, total: duration,
        progressPercent: data.processed_time / (duration ?? 0) * 100,
        eta: ((duration ?? 0) - data.processed_time) / data.speed
      }
    } else if (duration == null) {
      let matches = update[1].match(/Duration: +([0-9]+:[0-9]+:[0-9.]+)/)
      if (matches != null) {
        duration = parseDuration(matches[1]);
        console.log("Found duration:", duration);
      }
    }
  }
}
