<style>
  .wrapper {
    display: flex;
    justify-content: center;
  }
  .timeselect {
    margin: 10px;
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { selectedVideos, selectedVariation } from "../stores";
  export let activeAction: Writable<SvelteComponent | false>;
  import { videoElem } from "../stores";
  import LoadingBar from "../LoadingBar.svelte";
  import { TrimTask } from "../ffmpeg/trim";
  // let targetName = $selectedVariation?.name ?? $selectedVideos[0].name;

  function round(time: number) {
    return Math.round(time * 100) / 100;
  }

  let start = 0,
    end = round($videoElem!.duration);

  function setEndNow() {
    end = round($videoElem!.currentTime);
  }
  function setStartNow() {
    start = round($videoElem!.currentTime);
  }
  function setEndEnd() {
    end = round($videoElem!.duration);
  }
  function setStartStart() {
    start = 0;
  }

  let progress = 0;
  let complete = false;
  let started = false;
  let failed = false;
  let task: TrimTask;
  async function executeTrim() {
    console.log("Trimming video from " + start + " to " + end);
    started = true;
    task = new TrimTask($selectedVideos[0], $selectedVariation, start, end);
    task.on("progress", (p) => {
      progress = p.percent;
    });
    await task.execute();
    progress = 100;
    complete = true;
    $selectedVideos = $selectedVideos
    console.log("Done trimming video");
  }
  function done() {
    $activeAction = false;
  }
  function cancel() {
    task.cancel();
    $activeAction = false;
  }
</script>

{#if !started}
  <div class="wrapper">
    <div class="timeselect">
      <input
        bind:value="{start}"
        id="start"
        type="number"
        step=".01"
        min="0"
        max="{round($videoElem?.duration ?? 0)}"
      />
      <label for="start">Start Time</label>
      <button on:click="{setStartNow}">Now</button>
      <button on:click="{setStartStart}">Start</button>
    </div>
    <div class="timeselect">
      <input
        bind:value="{end}"
        id="end"
        type="number"
        step=".01"
        min="0"
        max="{Math.round($videoElem?.duration ?? 0 / 100) * 100}"
      />
      <label for="end">End Time</label>
      <button on:click="{setEndNow}">Now</button>
      <button on:click="{setEndEnd}">End</button>
    </div>
  </div>
  <button on:click="{executeTrim}">Trim</button>
  <button on:click="{() => ($activeAction = false)}">Cancel</button>
{:else}
  <div>
    <LoadingBar progress="{progress}" failed="{failed}" />
    {#if complete}
      <button on:click="{done}">Done</button>
    {:else}
      <button on:click="{cancel}">Cancel</button>
    {/if}
  </div>
{/if}
