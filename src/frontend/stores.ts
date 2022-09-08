import { writable } from "svelte/store";
import type { Variation, Video } from "./database";

export const selectedVideos = writable<Video[]>([]);
export const selectedVariation = writable<Variation | null>(null);
