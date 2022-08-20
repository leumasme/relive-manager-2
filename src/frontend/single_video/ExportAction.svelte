<style>
  .horizontal > * {
    flex-basis: 100px;
    height: 50px;
    margin: 5px;
  }
  .horizontal > button {
    padding: 0px;
  }
  .horizontal {
    display: flex;
    justify-content: center;
    color: #333;
  }
  .dragarea {
    box-sizing: border-box;
    background-color: #e7ecba;
    border: 1px dashed #aaa;
    width: 100px;
    size: 100px;
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  export let activeAction: Writable<SvelteComponent | false>;
  import { exec } from "child_process";
  import { selectedVariation, selectedVideo } from "../stores";
  import { BrowserWindow } from "@electron/remote";

  let path = $selectedVariation?.path ?? $selectedVideo!.path;

  function onDrag() {
    console.log("Dragging", path);
    BrowserWindow.getFocusedWindow()?.webContents.startDrag({
      file: path,
      icon: "./public/video.ico",
    });
  }

  function openExplorer() {
    // Open explorer to the currently selected Video or Variation
    exec(`explorer /select,"${path}"`);
  }

  function exit() {
    $activeAction = false;
  }
</script>

<div>
  <div class="horizontal">
    <div class="dragarea" draggable="true" on:dragstart="{onDrag}">Export <br />(drag me)</div>
    <button on:click="{openExplorer}">View in Explorer</button>
  </div>
  <button on:click="{exit}">Exit</button>
</div>
