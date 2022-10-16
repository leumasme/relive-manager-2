import { spawn } from "child_process";
import { parseDuration } from "./utils";

interface CancelableAsyncIterableIterator<T> extends AsyncIterableIterator<T> {
  canceled: boolean;
  cancel: () => void;
}

function runFFmpegCommandRaw(args: string[]): CancelableAsyncIterableIterator<[string, string]> {
  console.log("Running ffmpeg command:", "ffmpeg " + args.join(" "));
  let process = spawn("ffmpeg", args);

  let buffer: [string, string][] = [];
  type ResolveFunc = (
    value: IteratorResult<[string, string], any> | PromiseLike<IteratorResult<[string, string], any>>
  ) => void;
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
  });

  return {
    canceled: false,
    cancel() {
      process.kill();
      this.canceled = true;
    },
    [Symbol.asyncIterator]() {
      return this;
    },
    next: () => {
      return new Promise((resolve, reject) => {
        if (waiter != null) {
          // If already waiting, fail as we cant support multiple waiting at the same time
          reject(new Error("Async Iterator already in use"));
        } else if (buffer.length != 0) {
          // If we have data already stored up, we can resolve with that
          let val = buffer.shift()!;
          resolve({ value: val, done: false });
        } else {
          if (process.exitCode != null) {
            // If the process has already exited, we can resolve with done
            resolve({ value: undefined, done: true });
            return;
          }

          // No data is stored up, set to waiting and resolve in the process events
          waiter = resolve;
        }
      });
    },
  };
}

type FFmpegProgress = {
  current_size: number;
  bitrate: number;
  dropped_frames: number;
  duplicate_frames: number;
  processed_time: number;
  status: string;
  speed: number;
};
function parseFFmpegProgress(input: string): FFmpegProgress {
  let entries: Record<string, string> = Object.fromEntries(
    input
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .map((line) => line.split("=").map((l) => l.trim()))
  );
  return {
    current_size: parseInt(entries["total_size"]),
    bitrate: parseInt(entries["bitrate"].replace("kbit/s", "")),
    dropped_frames: parseInt(entries["drop_frames"]),
    duplicate_frames: parseInt(entries["dup_frames"]),
    processed_time: parseInt(entries["out_time_us"]) / 1000 / 1000,
    status: entries["progress"], // "continue" | "end" ?
    speed: parseInt(entries["speed"].replace("x", "")),
  };
}

export type Progress = {
  progress: number;
  speed: number;
  total: number;
  progressPercent: number;
  eta: number;
};

// This only works if the output length is the same as the input length
export function runFFmpegCommand(args: string[]): CancelableAsyncIterableIterator<Progress> {
  let output = runFFmpegCommandRaw(args);

  // We cant directly extend the IterableIterator that the generator function returns from within it,
  // so we have to create a separate generator function with our functionality inside a wrapper, call it
  // to get the IterableIterator and extend it that way.
  return Object.assign(
    (async function* () {
      let duration: number | null = null;
      for await (let update of output) {
        if (update[0] == "stdout") {
          let data = parseFFmpegProgress(update[1]);
          yield {
            progress: data.processed_time,
            speed: data.speed,
            total: duration!,
            progressPercent: (data.processed_time / (duration ?? 0)) * 100,
            eta: ((duration ?? 0) - data.processed_time) / data.speed,
          };
        } else if (duration == null) {
          let matches = update[1].match(/Duration: +([0-9]+:[0-9]+:[0-9.]+)/);
          if (matches != null) {
            duration = parseDuration(matches[1]);
            console.log("Found duration:", duration);
          }
        }
      }
    })(),
    {
      canceled: false,
      cancel() {
        output.cancel();
        this.canceled = true;
      },
    }
  );
}

export function extractAudio(src: string, dst: string): CancelableAsyncIterableIterator<Progress> {
  let output = runFFmpegCommand(["-i", src, "-q:a", "0", "-map", "a", dst, "-y", "-progress", "pipe:1"]);
  return Object.assign(
    (async function* () {
      yield* output;
    })(),
    {
      canceled: false,
      cancel() {
        output.cancel();
        this.canceled = true;
      },
    }
  );
}
/** Start and End as numbers of seconds, including fractions of a second */
export function trimAny(
  src: string,
  dst: string,
  start: number,
  end: number
): CancelableAsyncIterableIterator<Progress> {
  let output = runFFmpegCommand([
    "-i",
    src,
    "-ss",
    start.toString(),
    "-to",
    end.toString(),
    "-c:v",
    "copy",
    "-c:a",
    "copy",
    dst,
    "-y",
    "-progress",
    "pipe:1",
  ]);

  return Object.assign(
    (async function* () {
      let duration = end - start;
      for await (let update of output) {
        yield {
          ...update,
          total: duration,
          progressPercent: (update.progress / (duration ?? 0)) * 100,
          eta: ((duration ?? 0) - update.progress) / update.speed,
        };
      }
    })(),
    {
      canceled: false,
      cancel() {
        output.cancel();
        this.canceled = true;
      },
    }
  );
}
