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
</style>

<script lang="ts">
  export let videoPath = "Y:/ReLive Videos/Videos";

  const { parse } = require("path") as typeof import("path");
  import { getFiles } from "./utils";
  // ParsedPath of all mp4 files in the folder
  let fileProm = getFiles(videoPath).then((files) =>
    files.map((f) => parse(f)).filter((f) => f.ext == ".mp4")
  );

  import type { ParsedPath } from "path";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{ select: ParsedPath }>();
</script>

<div class="filelist">
  {#await fileProm}
    Loading Files...
  {:then files}
    {#each files as file}
      <div class="file" data-path="{file}" on:click="{() => dispatch('select', file)}">
        {file.name}
      </div>
    {/each}
  {/await}
</div>
