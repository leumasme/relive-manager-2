<style>
  .wrapper {
    padding: 16px;
  }
</style>

<script lang="ts">
  import type { Task } from "./ffmpeg/task";
  import LoadingBar from "./LoadingBar.svelte";

  export let task: Task;
  export let done: () => void;

  function cancel() {
    task.cancel();
    done();
  }

  // TODO: handle task errors, needs to be done in Task class

  let progress = task.progress;
  $: complete = $progress >= 100;
</script>

<div class="wrapper">
  <LoadingBar failed="{false}" progress="{$progress}" />
  {#if complete}
    <button on:click="{done}">Done</button>
  {:else}
    <button on:click="{done}">Hide</button>
    <button on:click="{cancel}">Cancel</button>
  {/if}
</div>
