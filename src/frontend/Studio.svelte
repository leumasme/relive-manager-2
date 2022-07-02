<style>
  h1 {
    margin-top: 0;
  }
  .container {
    display: grid;
    overflow: none;
    grid-template-columns: 1fr 14em;
    grid-template-rows: max-content 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      ". ."
      ". .";
  }
  .wrap {
    display: flex;
    flex-direction: column;
  }
</style>

<script lang="ts">
  import { selectedVideo } from "./stores";
  import TagManager from "./TagManager.svelte";

  $: filePath = $selectedVideo?.path;
</script>

{#if $selectedVideo}
  <!-- svelte-ignore a11y-media-has-caption -->
  <div class="container">
    <video controls width="100%" src="{filePath}"></video>
    <div class="wrap" style="padding:10px">
      <TagManager />
    </div>
    <i>Actions</i>
    <i>Variations</i>
  </div>
{:else}
  <h1>Select a Video...</h1>
{/if}
