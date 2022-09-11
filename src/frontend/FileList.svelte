<style>
  .all {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .search,
  .search > input {
    width: 100%;
    margin-bottom: 0px;
    background-color: rgb(60, 60, 60);
    color: rgb(204, 204, 204);
    border: none;
  }
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
    background-color: #888888;
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

  function onlyUniqueFilter<T>(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
  }

  function handleVideoClick(evt: MouseEvent, video: Video) {
    $selectedVariation = null;
    if (evt.ctrlKey) {
      if ($selectedVideos.includes(video)) {
        // remove video
        $selectedVideos.splice($selectedVideos.indexOf(video), 1);
      } else {
        $selectedVideos.push(video);
      }
      console.log("Multi-Selecting videos, currently", $selectedVideos.length);
      $selectedVideos = $selectedVideos;
    } else if (evt.shiftKey) {
      // select all videos between the last selected video and the current one
      // TODO: this will have to be reworked when we add sorting
      let lastSelected = $selectedVideos[$selectedVideos.length - 1];
      if (lastSelected) {
        let lastSelectedIndex = db.videos.indexOf(lastSelected);
        let currentIndex = db.videos.indexOf(video);
        let start = Math.min(lastSelectedIndex, currentIndex);
        let end = Math.max(lastSelectedIndex, currentIndex);
        let newlySelected = db.videos.slice(start, end + 1);
        // $selectedVideos will have to merged with newlySelected and deduped
        $selectedVideos = $selectedVideos.concat(newlySelected).filter(onlyUniqueFilter);
      } else {
        $selectedVideos = [video];
      }
    } else {
      $selectedVideos = [video];
      video.seen = true;
    }
  }
  function handleMouseEnter(evt: MouseEvent, video: Video) {
    if (evt.buttons == 1) {
      if (!$selectedVideos.includes(video)) {
        $selectedVideos.push(video);
        $selectedVideos = $selectedVideos;
      }
    }
  }

  let searchstr = "";
  $: shownVideos = db.videos.filter((v) => v.name.toLocaleLowerCase().includes(searchstr.toLocaleLowerCase()));
</script>

<div class="all">
  <div class="search">
    <input type="text" bind:value="{searchstr}" placeholder="Search" />
  </div>
  <div class="filelist">
    {#await fileProm}
      Loading Files...
    {:then}
      {#each searchstr.length == 0 ? db.videos : shownVideos as video}
        <div
          class="file"
          class:unseen="{!video.seen}"
          class:selected="{$selectedVideos.includes(video)}"
          on:click="{(evt) => {
            handleVideoClick(evt, video);
            video = video;
          }}"
          on:mouseenter="{(evt) => {
            handleMouseEnter(evt, video);
          }}"
        >
          {video.name}
        </div>
      {/each}
    {/await}
  </div>
</div>
