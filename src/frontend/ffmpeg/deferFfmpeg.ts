import type ffmpeg from "fluent-ffmpeg";

export class DeferredFfmpegJob {
  constructor(private fun: () => ffmpeg.FfmpegCommand) { }
  resolve() {
    return this.fun();
  }
}

export function deferFfmpeg(fun: () => ffmpeg.FfmpegCommand) {
  return new DeferredFfmpegJob(fun);
}