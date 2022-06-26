<style>
  h1 {
    margin-top: 0;
  }
  .container {
    display: grid;
    grid-template-columns: 1fr 14em;
    grid-template-rows: max-content 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      ". ."
      ". .";
  }
</style>

<script lang="ts">
  import { selectedVideo } from "./stores";

  $: filePath = $selectedVideo?.path;
</script>

{#if $selectedVideo}
  <!-- svelte-ignore a11y-media-has-caption -->
  <div class="container">
    <video controls width="100%" src="{filePath}"></video>
    <i>Tags</i>
    <i>Actions</i>
    <i>Variations</i>
  </div>
{:else}
  <h1>Select a Video...</h1>
{/if}
