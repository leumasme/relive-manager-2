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
  import { videoPath, variationPath } from "../database";

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
</script>

<!-- 
<input bind:this="{videoPathInput}" value="{videoPath}" />
<input bind:this="{variationInput}" value="{variationPath}" /> -->
<div class="wrapper">
  <label for="videoPath">Video Path</label>
  <input id="videoPath" bind:this="{videoPathInput}" value="{videoPath}" />
  <label for="variationPath">Variation Path</label>
  <input id="variationPath" bind:this="{variationInput}" value="{variationPath}" />
</div>
