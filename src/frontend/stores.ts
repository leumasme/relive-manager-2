import { writable } from "svelte/store";
import type { Variation, Video } from "./database";

export const selectedVideo = writable<Video | null>(null);
export const selectedVariation = writable<Variation | null>(null);