import ffmpeg from "fluent-ffmpeg";
import type { Variation, Video } from "../database";
import { generateVariationName, generateVariationPath } from "../utils";
import { createFolderTaskPart, Task } from "./task";
import { mkdir, rm, unlink } from "fs/promises";
import { ffprobe } from "./ffprobe";
import { deferFfmpeg } from "./deferFfmpeg";
import { dirname } from "path";

export class ReduceSizeTask extends Task {
  name = "Reduce Size";
  output: string;
  parts;
  tempDir = `${process.env.TEMP}\\relive-manager\\${Math.random().toString(36).substring(2, 15)}`;
  constructor(
    public video: Video,
    public variation: Variation | null,
    public targetSize: number
  ) {
    super();
    this.output = generateVariationPath("mp4");
    let videoBitrate: number;

    this.parts = [
      createFolderTaskPart(this.output, true),
      async () => {
        let probe = await ffprobe((variation ?? video).path);
        let audioStreams = probe.streams.filter(s => s.codec_type === "audio");
        // Total audio size in bits
        let audioSize = audioStreams
          .map(s => Number(s.bit_rate) * Number(s.duration))
          .filter(s => !isNaN(s))
          .reduce((a, b) => a + b, 0);

        let videoStreams = probe.streams.filter(s => s.codec_type === "video");
        if (videoStreams.length !== 1) throw new Error("File has more than one video stream, which is not supported");
        let videoLength = Number(videoStreams[0].duration);

        videoBitrate = (targetSize * 8 - (audioSize / 1000)) / videoLength;
        // TODO: Handle properly; this happens if audio is too large
        if (videoBitrate < 1) throw new Error("Target size is too small");
      },
      deferFfmpeg(() =>
        ffmpeg((variation ?? video).path, { cwd: this.tempDir })
          .addOption(["-pass", "1"])
          .videoCodec("libx264")
          .videoBitrate(videoBitrate)
          .format("mp4")
          .output("NUL"),
      ),
      deferFfmpeg(() =>
        ffmpeg((variation ?? video).path, { cwd: this.tempDir })
          .addOption(["-pass", "2"])
          .videoCodec("libx264")
          .videoBitrate(videoBitrate)
          .audioCodec("copy")
          .output(this.output),
      ),
      async () => {
        video.variations.push({
          name: generateVariationName("Shrunk", video),
          actions: [...(variation?.actions ?? []), { type: "reduceSize" }],
          path: this.output,
        });
        await rm(this.tempDir, { recursive: true, force: true }).catch(() => console.error);
      }
    ]
  }

  override async execute(): Promise<void> {
    // Before executing normal task behavior, create temp directory
    await mkdir(this.tempDir, { recursive: true });
    return super.execute();
  }

  protected async cleanupCancel() {
    await unlink(this.output).catch(() => { });
    await rm(this.tempDir, { recursive: true, force: true }).catch(() => {});
    // TODO: Remove intermediary files from ffmpeg 2-pass
  }
  async deleteTwopassFiles() {
    let folder = dirname((this.variation ?? this.video).path);
    console.log("Dirname: ", folder)
    // unlink(folder + "ffmpeg2pass-0.log.mbtree.temp")
    // unlink(folder + "ffmpeg2pass-0.log.temp")
  }
}