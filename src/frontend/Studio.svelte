<style>
  h1 {
    margin-top: 0;
  }
  .container {
    height: 100%;
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
    padding: 10px;
  }
  .aspect {
    aspect-ratio: 16 / 9;
  }
  .inactive {
    background-color: rgb(55, 55, 55);
    background-clip: content-box;
    justify-content: center;
    color:rgb(127, 127, 127);
  }
  .vid > video {
    /* background-color: rgb(55, 55, 55); */
    /* background-clip: content-box; */
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
<script lang="ts" context="module">
  import { writable } from "svelte/store";
  export let videoElem = writable<HTMLVideoElement | null>(null);
</script>
<script lang="ts">
  import SingleVideoActions from "./single_video/Actions.svelte";
  import MultiVideoActions from "./multi_video/Actions.svelte";
  import VariationManager from "./single_video/VariationManager.svelte";
  import { selectedVideos, selectedVariation } from "./stores";
  import TagManager from "./TagManager.svelte";
  import { access } from "fs/promises";
  import { db } from "./database";

  $: filePath = $selectedVariation?.path ?? $selectedVideos[0]?.path;

  async function videoLoadFailed() {
    try {
      await access(filePath!);
    } catch {
      if ($selectedVariation?.path) {
        let del = confirm("The Variation file has been deleted. Do you want to remove it from the database?");
        if (del) {
          $selectedVideos[0]?.variations.splice($selectedVideos[0].variations.indexOf($selectedVariation), 1);
          $selectedVariation = null;
          $selectedVideos = $selectedVideos;
        }
      } else {
        let del = confirm("The Video file has been deleted. Do you want to remove it from the database?");
        if (del) {
          db.videos.splice(db.videos.indexOf($selectedVideos[0]), 1);
          $selectedVideos = [];
        }
      }
      return;
    }
    alert("Failed to load video!");
  }
</script>

{#if $selectedVideos.length == 1}
  {#key $selectedVideos[0].path}
    <!-- svelte-ignore a11y-media-has-caption -->
    <div class="container">
      <div class="wrap vid aspect">
        <video controls width="100%" src="{filePath}" on:error="{videoLoadFailed}" bind:this={$videoElem}></video>
      </div>
      <div class="wrap">
        <TagManager />
      </div>
      <div class="wrap">
        <SingleVideoActions />
      </div>
      <div class="wrap">
        <VariationManager />
      </div>
    </div>
  {/key}
{:else if $selectedVideos.length > 1}
  {#key $selectedVideos}
    <div class="container">
      <div class="wrap inactive aspect">
        <h1>{$selectedVideos.length} Videos Selected</h1>
      </div>
      <div class="wrap inactive"><span>...</span></div>
      <div class="wrap">
        <MultiVideoActions />
      </div>
      <div class="wrap inactive"><span>...</span></div>
    </div>
  {/key}
{:else}
  <h1>Select a Video...</h1>
{/if}
