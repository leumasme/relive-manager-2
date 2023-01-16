import ffmpeg from "fluent-ffmpeg";
import type { Variation, Video } from "../database";
import { generateVariationName, generateVariationPath } from "../utils";
import { createFolderTaskPart, Task, type TaskPart } from "./task";
import { unlink } from "fs/promises";

export class ExtractAudioTask extends Task {
  name = "Extract Audio";
  parts: (TaskPart | ffmpeg.FfmpegCommand)[];
  output: string;
  constructor(
    public video: Video,
    public variation: Variation | null,
  ) {
    super();
    this.output = generateVariationPath("mp3");
    this.parts = [
      createFolderTaskPart(this.output, true),
      ffmpeg((variation ?? video).path)
        .noVideo().addOption("-map a")
        .output(this.output),
      () => {
        video.variations.push({
          name: generateVariationName("Audio", video),
          actions: [...(variation?.actions ?? []), { type: "extractAudio" }],
          path: this.output,
        })
      }
    ]
  }

  protected async cleanupCancel() {
    await unlink(this.output).catch(() => { });
  }
}