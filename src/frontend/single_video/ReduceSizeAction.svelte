<style>
  .wrapper {
    display: flex;
    justify-content: center;
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { selectedVideos, selectedVariation, activeTasks } from "../stores";
  import ActionStatusDisplay from "../ActionStatusDisplay.svelte";
  import { ReduceSizeTask } from "../ffmpeg/reduceSize";
  export let activeAction: Writable<SvelteComponent | false>;

  let task: ReduceSizeTask;
  let targetSizeInKb: number;
  
  async function executeTask() {
    console.log("Reducing Video Size to ");
    task = new ReduceSizeTask($selectedVideos[0], $selectedVariation, targetSizeInKb);
    activeTasks.add(task);
    await task.execute();

    console.log("Done reducing Video Size");
  }

  function done() {
    $activeAction = false;
  }
</script>
{#if !task}
<!-- TODO: make this look half-decent -->
  <div class="wrapper">
    <!-- TODO: save previous value -->
    <input type="number" bind:value="{targetSizeInKb}" />
  </div>
  <button on:click="{executeTask}">Start</button>
  <button on:click="{() => ($activeAction = false)}">Cancel</button>
{:else}
  <ActionStatusDisplay task="{task}" done="{done}" />
{/if}
