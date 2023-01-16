import { writable, type Readable } from "svelte/store";
import type { Variation, Video } from "./database";
import type { Task } from "./ffmpeg/task";

export const selectedVideos = writable<Video[]>([]);
export const selectedVariation = writable<Variation | null>(null);
export const videoElem = writable<HTMLVideoElement | null>(null);

type TaskStore = Readable<Task[]> & {
  add: (task: Task) => void;
};
function createTaskStore(): TaskStore {
  const { subscribe, update } = writable<Task[]>([]);
  return {
    subscribe,
    add: (task: Task) => {
      task.on("complete", () => {
        update((tasks) => tasks.filter((t) => t !== task));
      })
      update((tasks) => [...tasks, task]);
    }
  };
}
export const activeTasks = createTaskStore();
