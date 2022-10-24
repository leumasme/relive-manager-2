<style>
  .wrapper {
    padding: 16px;
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { selectedVideos, selectedVariation } from "../stores";
  import LoadingBar from "../LoadingBar.svelte";
  import { ExtractAudioTask } from "../ffmpeg/extractAudio";

  export let activeAction: Writable<SvelteComponent | false>;

  let progress = 0;
  let complete = false;
  let failed = false;
  let task: ExtractAudioTask;
  (async () => {
    console.log("Extracting audio...");
    task = new ExtractAudioTask($selectedVideos[0], $selectedVariation);
    task.on("progress", (p)=>{
      progress = p.percent;
    })
    await task.execute();
    progress = 100;
    complete = true;
    $selectedVideos = $selectedVideos
    console.log("Done extracting audio");
  })();

  function done() {
    $activeAction = false;
  }
  function cancel() {
    task?.cancel();
    done();
  }
</script>

<div class="wrapper">
  <LoadingBar failed="{failed}" progress="{progress}" />
  {#if complete}
    <button on:click="{done}">Done</button>
  {:else}
    <button on:click="{cancel}">Cancel</button>
  {/if}
</div>
