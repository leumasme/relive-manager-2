import EventEmitter, { once } from "events";
import type ffmpeg from "fluent-ffmpeg";
import type TypedEmitter from "typed-emitter";

interface FFmpegProgress {
  frames: number; // processed frames
  currentFps: number; // current fps throughput
  currentKbps: number; // current kbps throughput
  targetSize: number; // current output file size
  timemark: string; // TODO // current frame timestamp in seconds
  percent?: number; // estimated progress percentage
}
type FFmpegEvents = {
  start: (command: string) => void;
  // codecData: (data: any) => void;
  progress: (progress: FFmpegProgress) => void;
  // stderr: (line: string) => void;
  error: (err: Error, stdout: string, stderr: string) => void;
  canceled: () => void;
  end: (stdout: string, stderr: string) => void;
};

export class FfmpegJob extends (EventEmitter as new () => TypedEmitter<FFmpegEvents>) {
  started = false;
  completed = false;
  canceled = false;
  paused = false;
  get running() {
    return this.started && !this.completed && !this.canceled;
  }
  progress: FFmpegProgress = {
    frames: 0,
    currentFps: 0,
    currentKbps: 0,
    targetSize: 0,
    timemark: "00:00:00.00",
    percent: 0,
  };
  constructor(private task: ReturnType<typeof ffmpeg>) {
    super();
  }
  async start() {
    if (this.started) throw new Error("Already Started");
    this.started = true;
    this.task.on("start", (command) => {
      this.started = true;
      console.log("Using ffmpeg command", command);
      this.emit("start", command);
    });
    this.task.on("progress", (progress) => {
      this.progress = progress;
      this.emit("progress", progress);
    });
    this.task.on("error", (err, stdout, stderr) => {
      if (this.canceled) this.emit("canceled");
      else {
        console.error("FfmpegJob got an error from ffmpeg", err, stdout, stderr);
        this.emit("error", err, stdout, stderr);
      }
    });
    this.task.on("end", (stdout, stderr) => {
      this.completed = true;
      this.emit("end", stdout, stderr);
    });
    this.task.run();
    await once(this, "start");
  }
  async waitOnce(names: keyof FFmpegEvents | (keyof FFmpegEvents)[]) {
    if (Array.isArray(names)) {
      // If error is not the first event, the code will not work as "once" throws if
      // an "error" event is emitted and the event that "once" is listening for is not "error"
      if (names.indexOf("error") > 0) throw new Error("waitOnce must receive error as the first item");

      const abort = new AbortController();
      const val = await Promise.race(names.map((name) => once(this, name, { signal: abort.signal })));
      abort.abort();
      return val;
    } else return await once(this, names);
  }
  cancel() {
    if (!this.running) throw new Error("Tried to cancel task that isn't running");
    this.canceled = true;
    this.task.kill("SIGKILL");
  }
  pause() {
    if (!this.running) throw new Error("Tried to pause task that isn't running");
    if (this.paused) throw new Error("Tried to pause task that is already paused");
    this.paused = true;
    this.task.kill("SIGSTOP");
  }
  resume() {
    if (!this.running) throw new Error("Tried to resume task that isn't running");
    if (!this.paused) throw new Error("Tried to resume task that isn't paused");
    this.paused = false;
    this.task.kill("SIGCONT");
  }
}
