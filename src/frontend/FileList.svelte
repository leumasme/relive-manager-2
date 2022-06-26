<style>
  .filelist {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    /* thinner scrollbar + darkmode for chrome */
    overflow: overlay;
    padding-right: 0px;
  }
  .filelist::-webkit-scrollbar {
    width: 0.5em;
    margin-left: -0.5em;
  }
  .filelist::-webkit-scrollbar-track {
    opacity: 0;
  }
  .filelist::-webkit-scrollbar-thumb {
    background-color: #746c6c73;
  }
  .file {
    text-align: left;
    color: rgb(204, 204, 204);
    /* text that is too long gets shortened to ... */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* text not selectable */
    user-select: none;
  }
  .unseen {
    background-color: #5e1515;
  }
</style>

<script lang="ts">
  export let videoPath = "Y:/ReLive Videos/Videos";

  import { parse } from "path";
  import { db } from "./database";
  import chokidar from "chokidar";

  let fileProm = new Promise<void>((resolve) => {
    chokidar
      .watch(videoPath, {
        awaitWriteFinish: true,
        ignored: (p) => {
          if (p.includes("_cache")) return true;
          let parsed = parse(p);
          if (parsed.ext != "" && parsed.ext != ".mp4") return true
          return false;
        },
        ignoreInitial: false,
      })
      .on("add", (path) => {
        console.log(path, db.videos.length);
        if (db.videos.find((v) => v.path == path)) return;
        db.videos.push({
          path,
          name: parse(path).base.split(".").slice(0, -1).join("."),
          seen: false,
          tags: [],
          variations: [],
        });
        console.log("New File: ", path);
      })
      .on("ready", () => {
        console.log("Ready");
        resolve();
      });
  });
  import type { ParsedPath } from "path";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{ select: ParsedPath }>();
</script>

<div class="filelist">
  {#await fileProm}
    Loading Files...
  {:then}
    {#each db.videos as video}
      <div
        class="file"
        class:unseen="{!video.seen}"
        on:click="{function () {
          dispatch('select', parse(video.path));
          video.seen = true;
          video = video;
        }}"
      >
        {video.name}
      </div>
    {/each}
  {/await}
</div>