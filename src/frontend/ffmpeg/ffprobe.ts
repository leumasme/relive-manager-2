import Ffmpeg, { ffprobe as ffprobe_cb } from "fluent-ffmpeg";
import type { AudioStreamMeta, Variation, Video } from "../database";

export function ffprobe(file: string, options: string[] = []) {
  return new Promise<Ffmpeg.FfprobeData>((resolve, reject) => {
    ffprobe_cb(file, options, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

async function probeAudioStreams(file: string): Promise<AudioStreamMeta[]> {
  const data = await ffprobe(file);
  return data.streams
    .filter((s) => s.codec_type === "audio")
    .map((s) => ({
      codec: s.codec_name ?? "unknown",
    }));
}

const pendingProbes = new WeakMap<Video | Variation, Promise<AudioStreamMeta[]>>();

/**
 * Returns cached audio stream metadata for a video or variation,
 * probing with ffprobe on the first call and caching the result in the database.
 * Deduplicates concurrent probes for the same target.
 */
export function ensureAudioStreams(target: Video | Variation): Promise<AudioStreamMeta[]> {
  if (target.audioStreams !== undefined) return Promise.resolve(target.audioStreams);
  const pending = pendingProbes.get(target);
  if (pending) return pending;
  const promise = probeAudioStreams(target.path)
    .then((streams) => {
      target.audioStreams = streams;
      return target.audioStreams;
    })
    .finally(() => pendingProbes.delete(target));
  pendingProbes.set(target, promise);
  return promise;
}
