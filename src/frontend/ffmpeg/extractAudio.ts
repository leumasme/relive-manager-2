import ffmpeg from "fluent-ffmpeg";
import type { Variation, Video } from "../database";
import { generateVariationName, generateVariationPath } from "../utils";
import { createFolderTaskPart, Task } from "./task";
import { unlink } from "fs/promises";
import { markVideoUpdated } from "../stores";

export type AudioExtractMode =
  | { type: "single" } // There's one audio stream, extract it directly
  | { type: "pick"; streamIndex: number } // Pick a specific audio stream by its audio-relative index
  | { type: "merge"; streamCount: number }; // Merge all audio streams into one

export class ExtractAudioTask extends Task {
  name = "Extract Audio";
  output: string;
  parts;
  constructor(public video: Video, public variation: Variation | null, public mode: AudioExtractMode) {
    super();
    this.output = generateVariationPath("mp3");
    const inputPath = (variation ?? video).path;

    let command: ffmpeg.FfmpegCommand;
    if (mode.type === "merge") {
      // Use amix filter to merge all audio streams into one
      const inputs = Array.from({ length: mode.streamCount }, (_, i) => `[0:a:${i}]`).join("");
      command = ffmpeg(inputPath)
        .noVideo()
        .complexFilter([`${inputs}amix=inputs=${mode.streamCount}:duration=longest:normalize=0`])
        .output(this.output);
    } else {
      const streamIndex = mode.type === "pick" ? mode.streamIndex : 0;
      command = ffmpeg(inputPath)
        .noVideo()
        .addOption("-map", `0:a:${streamIndex}`)
        .output(this.output);
    }

    this.parts = [
      createFolderTaskPart(this.output, true),
      command,
      () => {
        video.variations.push({
          name: generateVariationName("Audio", video),
          actions: [
            ...(variation?.actions ?? []),
            {
              type: "extractAudio",
              args:
                mode.type === "pick"
                  ? { mode: "pick", streamIndex: mode.streamIndex }
                  : { mode: mode.type },
            },
          ],
          path: this.output,
          audioStreams: [{ codec: "mp3" }],
        });
        markVideoUpdated(video);
      },
    ];
  }

  protected async cleanupCancel() {
    await unlink(this.output).catch(() => {});
  }
}
