import EventEmitter, { once } from "events";
import ffmpeg from "fluent-ffmpeg";
import { mkdir } from "fs/promises";
import { parse } from "path";
import { writable } from "svelte/store";
import type TypedEmitter from "typed-emitter"
import { FfmpegJob } from "./wrapper";

interface TaskProgress {
  percent: number;
}
type TaskEvents = {
  progress: (progress: TaskProgress) => void;
  complete: () => void;
}
export type TaskPart = FfmpegJob | (() => Promise<void>) | (() => void);

export abstract class Task extends (EventEmitter as new () => TypedEmitter<TaskEvents>) {
  abstract name: string;
  started = false;
  completed = false;
  canceled = false;
  progress = writable(0);
  get success() {
    return this.completed && !this.canceled;
  }
  // The task consists of a series of parts, which are executed in order.
  abstract parts: (TaskPart | ffmpeg.FfmpegCommand)[];
  private activePart: TaskPart | null = null;
  async execute() {
    this.started = true;
    for (let [i, part] of this.parts.entries()) {
      if (this.canceled) break;
      console.time("TaskPart " + i);

      if (isFfmpegCommand(part)) part = new FfmpegJob(part);
      this.activePart = part;
      if (part instanceof FfmpegJob) {
        part.on("progress", (progress) => {
          this.updateProgress(progress.percent ?? 0, i);
        });
        // TODO: handle errors
        part.start();
        await part.waitOnce(["end", "canceled"]);
      } else {
        await part();
      }
      this.updateProgress(100, i);
      console.timeEnd("TaskPart " + i);
    }
    this.completed = true;
    this.emit("complete");
    this.activePart = null;
  }
  async cancel() {
    this.canceled = true;
    if (this.activePart instanceof FfmpegJob) {
      this.activePart.cancel();
      await this.activePart.waitOnce(["end", "canceled"]);
    }
    this.cleanupCancel();
  };
  async waitOnce<T extends keyof TaskEvents>(names: T | T[]) {
    if (Array.isArray(names)) {
      const abort = new AbortController();
      const val = await Promise.race(names.map(name => once(this, name, { signal: abort.signal })));
      abort.abort();
      return val;
    } else return await once(this, names);
  }
  updateProgress(percent: number, index: number) {
    // The FFmpegJobs should take up 90% of the progress bar, and the rest is for function tasks.
    let jobCount = this.parts.filter(isFfmpegCommand).length;
    let funcCount = this.parts.length - jobCount;
    let calc = 0;
    for (let i = 0; i < index; i++) {
      if (isFfmpegCommand(this.parts[i])) calc += 90 / jobCount;
      else calc += 10 / funcCount;
    }
    calc += percent / 100 * (isFfmpegCommand(this.parts[index]) ? 90 / jobCount : 10 / funcCount);
    this.progress.set(calc);
    this.emit("progress", { percent: calc });
  }
  // This method is called when the task is canceled, and should delete any files created by the task.
  protected abstract cleanupCancel(): Promise<void>;
}

export function createFolderTaskPart(path: string, hasFileName = false) {
  return async () => {
    if (hasFileName) ({ dir: path } = parse(path));
    await mkdir(path, { recursive: true });
  }
}

function isFfmpegCommand(part: any): part is ffmpeg.FfmpegCommand {
  return part instanceof ffmpeg;
}