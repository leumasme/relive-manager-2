import Ffmpeg, { ffprobe as ffprobe_cb } from "fluent-ffmpeg";

export function ffprobe(file: string, options: string[] = []) {
  return new Promise<Ffmpeg.FfprobeData>((resolve, reject) => {
    ffprobe_cb(file, options, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}