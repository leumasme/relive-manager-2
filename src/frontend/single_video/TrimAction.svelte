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
  import { selectedVideos, selectedVariation, activeTasks } from "../stores";
  import { videoElem } from "../stores";
  import { TrimTask } from "../ffmpeg/trim";
  import ActionStatusDisplay from "../ActionStatusDisplay.svelte";
  export let activeAction: Writable<SvelteComponent | false>;

  function round(time: number) {
    return Math.round(time * 100) / 100;
  }

  let start = 0;
  let end = round($videoElem!.duration);

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

  let task: TrimTask;
  async function executeTrim() {
    console.log("Trimming video from " + start + " to " + end);
    task = new TrimTask($selectedVideos[0], $selectedVariation, start, end);
    activeTasks.add(task);
    await task.execute();

    console.log("Done trimming video");
  }

  function done() {
    $activeAction = false;
  }
</script>

{#if !task}
  <div class="wrapper">
    <div class="timeselect">
      <input bind:value="{start}" type="number" step=".01" min="0" max="{round($videoElem?.duration ?? 0)}" />
      <label for="start">Start Time</label>
      <button on:click="{setStartNow}">Now</button>
      <button on:click="{setStartStart}">Start</button>
    </div>
    <div class="timeselect">
      <input bind:value="{end}" type="number" step=".01" min="0" max="{round($videoElem?.duration ?? 0)}" />
      <label for="end">End Time</label>
      <button on:click="{setEndNow}">Now</button>
      <button on:click="{setEndEnd}">End</button>
    </div>
  </div>
  <div>
    <button on:click="{executeTrim}">Trim</button>
    <button on:click="{() => ($activeAction = false)}">Cancel</button>
  </div>
{:else}
  <ActionStatusDisplay task="{task}" done="{done}" />
{/if}
