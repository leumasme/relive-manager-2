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
  import { db } from "../database";
  export let activeAction: Writable<SvelteComponent | false>;

  let task: ReduceSizeTask;
  // Typing nothing into the size input field makes this null
  let targetSizeInKb: number | null = db.settings.reduceSizeTarget;

  // Only save valid values to the database
  $: if (targetSizeInKb && targetSizeInKb > 0) {
    db.settings.reduceSizeTarget = targetSizeInKb;
  }

  // Disable start button if input is invalid
  $: isValidInput = targetSizeInKb !== null && targetSizeInKb > 0;

  async function executeTask() {
    console.log("Reducing Video Size to", targetSizeInKb, "KB");
    task = new ReduceSizeTask($selectedVideos[0], $selectedVariation, targetSizeInKb!);
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
    <input type="number" bind:value="{targetSizeInKb}" placeholder="Size in KB" />
  </div>
  <div>
    <button on:click="{executeTask}" disabled="{!isValidInput}">Start</button>
    <button on:click="{() => ($activeAction = false)}">Cancel</button>
  </div>
{:else}
  <ActionStatusDisplay task="{task}" done="{done}" />
{/if}
