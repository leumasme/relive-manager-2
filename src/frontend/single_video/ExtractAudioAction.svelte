<style>
  .wrapper {
    padding: 16px;
  }
  .loadwrapper {
    display: flex;
    background-color: gray;
    margin-bottom: 16px;
  }
  .loadinner {
    background-color: green;
    height: 25px;
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { extractAudio } from "../ffmpeg";
  import { selectedVideo } from "../stores";

  export let activeAction: Writable<SvelteComponent | false>;

  let progress: number = 0;
  let complete = false;
  (async () => {
    console.log("Extracting audio...");
    let iter = extractAudio($selectedVideo!.path, "deleteme.mp3");

    for await (let update of iter) {
      progress = update.progressPercent;
    }
    progress = 100;
    complete = true;
    // $selectedVideo!.variations.push({
    //   actions: [{ type: "extractAudio" }],
    //   name
    // });
    console.log("Done extracting audio");
  })();

  function cancel() {
    $activeAction = false;
  }
  function done() {
    $activeAction = false;
  }
</script>

<div class="wrapper">
  <div class="loadwrapper" style="background-color: gray;">
    <div class="loadinner" style="width:{progress}%;"></div>
  </div>
  {#if !complete}
    <button on:click="{cancel}">Cancel</button>
  {:else}
    <button on:click="{done}">Done</button>
  {/if}
</div>
