<style>
  .wrapper {
    display: grid;
    grid-template-columns: max-content max-content;
    grid-gap: 5px;
  }
  .wrapper > label {
    display: flex;
    align-items: center;
    justify-content: end;
  }
</style>

<script lang="ts">
  import { onDestroy } from "svelte";
  import { videoPath, variationPath, db } from "../database";
  import fs from "fs/promises";
  import glob from "fast-glob";

  let videoPathInput: HTMLInputElement;
  let variationInput: HTMLInputElement;

  onDestroy(() => {
    console.log("destroyed");
    if (videoPathInput.value !== videoPath || variationInput.value !== variationPath) {
      localStorage.setItem("videoPath", videoPathInput.value);
      localStorage.setItem("variationPath", variationInput.value);
      console.log("Paths were changed, reloading...");
      location.reload();
    }
  });

  async function cleanDatabaseEntries() {
    // find all db video entries that don't have a file using the fs promises api
    let dbVideos = db.videos;
    let unusedVideos = await Promise.all(
      dbVideos.map(async (video) => {
        try {
          await fs.stat(video.path);
        } catch (e) {
          return video.path;
        }
        return undefined;
      })
    );
    unusedVideos = unusedVideos.filter((video) => video !== undefined);

    // find all db variation entries that don't have a file using the fs promises api
    let dbVariations = db.videos.map((v) => v.variations).flat();
    let unusedVariations = await Promise.all(
      dbVariations.map(async (variation) => {
        try {
          await fs.stat(variation.path);
        } catch (e) {
          return variation.path;
        }
        return undefined;
      })
    );
    unusedVariations = unusedVariations.filter((variation) => variation !== undefined);

    if (
      confirm(
        "Are you sure you want to remove " +
          unusedVideos.length +
          " videos and " +
          unusedVariations.length +
          " variations from the database?"
      )
    ) {
      // remove all unused videos from the db
      db.videos = db.videos.filter((video) => !unusedVideos.includes(video.path));

      // remove all unused variations from the db
      db.videos.forEach((video) => {
        video.variations = video.variations.filter((variation) => !unusedVariations.includes(variation.path));
      });
    }
  }
  async function cleanUnlikedVariations() {
    let files = await glob(variationPath + "/**/*.{mp4,mp3}");

    let variations = db.videos.map((v) => v.variations).flat();
    let unusedVariations = files.filter((file) => !variations.map((v) => v.path).includes(file));
    if (confirm("Are you sure you want to remove " + unusedVariations.length + " variations from the file system?")) {
      unusedVariations.forEach((variation) => {
        fs.unlink(variation);
      });
    }
  }
  function resetDatabase() {
    if (confirm("Are you sure you want to reset the database?")) {
      localStorage.removeItem("database");
      location.reload();
    }
  }
</script>

<!-- 
<input bind:this="{videoPathInput}" value="{videoPath}" />
<input bind:this="{variationInput}" value="{variationPath}" /> -->
<div class="wrapper">
  <label for="videoPath">Video Path</label>
  <input id="videoPath" bind:this="{videoPathInput}" value="{videoPath}" />
  <label for="variationPath">Variation Path</label>
  <input id="variationPath" bind:this="{variationInput}" value="{variationPath}" />
  <button on:click="{cleanDatabaseEntries}">Remove Broken Database Entries</button>
  <button on:click="{cleanUnlikedVariations}">Remove Unlinked Variation Files</button>
  <button on:click="{resetDatabase}">Reset Database</button>
</div>
