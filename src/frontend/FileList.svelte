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
  .selected {
    background-color: #aaaaaa;
  }
</style>

<script lang="ts">
  import { parse } from "path";
  import { db, videoPath, type Video } from "./database";
  import chokidar from "chokidar";
  import { selectedVideos, selectedVariation } from "./stores";

  let fileProm = new Promise<void>((resolve) => {
    let watcher = chokidar
      .watch(videoPath, {
        awaitWriteFinish: true,
        ignored: (p) => {
          if (p.includes("_cache")) return true;
          let parsed = parse(p);
          if (parsed.ext != "" && parsed.ext != ".mp4") return true;
          return false;
        },
        ignoreInitial: false,
      })
      .on("add", (path) => {
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
        if (Object.keys(watcher.getWatched()).length == 0) {
          console.warn("Replay Directory does not exist");
        }
        console.log("Filesystem Watcher Ready");
        resolve();
      });
  });

  function handleVideoClick(evt: MouseEvent, video: Video) {
    $selectedVariation = null;
    if (evt.ctrlKey) {
      console.log("Multi-Select, currently selecting ", $selectedVideos);
      if ($selectedVideos.includes(video)) {
        // remove video
        $selectedVideos.splice($selectedVideos.indexOf(video), 1);
      } else {
        $selectedVideos.push(video);
      }
      $selectedVideos = $selectedVideos;
    } else {
      $selectedVideos = [video];
    }
  }
</script>

<div class="filelist">
  {#await fileProm}
    Loading Files...
  {:then}
    {#each db.videos as video}
      <div
        class="file"
        class:unseen="{!video.seen}"
        class:selected="{$selectedVideos.includes(video)}"
        on:click="{(evt) => {
          handleVideoClick(evt, video);
          video = video;
        }}"
      >
        {video.name}
      </div>
    {/each}
  {/await}
</div>
