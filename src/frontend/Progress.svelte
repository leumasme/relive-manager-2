<style>
  .progress {
    position: absolute;
    background-color: green;
    flex-grow: 1;
    left: 0;
    top: 0;
    bottom: 0;
  }
</style>

<script lang="ts">
  import type { Writable } from "svelte/store";

  export let progress: Writable<number>;
</script>

<!-- It's currently necessary to have this in a subcomponent as we can't use stores from a {#each} directly inside it -->
<div class="progress" style:width="{$progress}%"></div>