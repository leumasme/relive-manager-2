import ffmpeg from "fluent-ffmpeg";
import { extname } from "path";
import type { Variation, Video } from "../database";
import { generateVariationName, generateVariationPath } from "../utils";
import { createFolderTaskPart, Task } from "./task";
import { unlink } from "fs/promises";
import { markVideoUpdated } from "../stores";

export class MuteAudioTask extends Task {
  name = "Mute Audio";
  output: string;
  parts;
  constructor(public video: Video, public variation: Variation | null) {
    super();
    this.output = generateVariationPath(extname((variation ?? video).path));
    this.parts = [
      createFolderTaskPart(this.output, true),
      ffmpeg((variation ?? video).path)
        .noAudio()
        .videoCodec("copy")
        .output(this.output),
      () => {
        video.variations.push({
          name: generateVariationName("Muted", video),
          actions: [...(variation?.actions ?? []), { type: "muteAudio" }],
          path: this.output,
          audioStreams: [],
        });
        markVideoUpdated(video);
      },
    ];
  }

  protected async cleanupCancel() {
    await unlink(this.output).catch(() => {});
  }
}
