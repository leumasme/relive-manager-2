import { writable } from "svelte/store";
import type { Video } from "./database";

export const selectedVideo = writable<Video | null>(null);