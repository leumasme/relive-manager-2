<style>
  .wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  .task {
    text-align: left;
    color: rgb(204, 204, 204);
    /* text that is too long gets shortened to ... */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* text not selectable */
    user-select: none;
    display: flex;
    position: relative;
  }
  .text {
    z-index: 2;
  }
</style>

<script lang="ts">
  import Progress from "./Progress.svelte";
  import { activeTasks } from "./stores";
</script>

<div class="wrapper">
  {#each $activeTasks as task}
    <div class="task">
      <Progress progress="{task.progress}" />
      <div class="text">{task.name}</div>
    </div>
  {/each}
</div>
