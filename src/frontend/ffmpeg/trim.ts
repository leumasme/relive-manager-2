import ffmpeg from "fluent-ffmpeg";
import { extname } from "path";
import type { Variation, Video } from "../database";
import { generateVariationName, generateVariationPath } from "../utils";
import { createFolderTaskPart, Task } from "./task";
import { unlink } from "fs/promises";
import { markVideoUpdated } from "../stores";

export class TrimTask extends Task {
  name = "Trim";
  output: string;
  parts;
  constructor(public video: Video, public variation: Variation | null, public start: number, public end: number) {
    super();
    this.output = generateVariationPath(extname((variation ?? video).path));
    this.parts = [
      createFolderTaskPart(this.output, true),
      ffmpeg((variation ?? video).path)
        .setStartTime(start)
        .setDuration(end - start)
        .videoCodec("copy")
        .audioCodec("copy")
        .output(this.output),
      () => {
        video.variations.push({
          name: generateVariationName("Trim", video),
          actions: [...(variation?.actions ?? []), { type: "trim", args: { start, end } }],
          path: this.output,
        });
        markVideoUpdated(video);
      },
    ];
  }

  protected async cleanupCancel() {
    await unlink(this.output).catch(() => {});
  }
}
