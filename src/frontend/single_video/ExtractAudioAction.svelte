<style>
  .wrapper {
    padding: 16px;
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { extractAudio } from "../ffmpeg";
  import { selectedVideos, selectedVariation } from "../stores";
  import { generateVariationPath } from "../utils";
  import fs from "fs/promises";
  import { dirname } from "path";
  import LoadingBar from "../LoadingBar.svelte";

  export let activeAction: Writable<SvelteComponent | false>;

  let progress: number = 0;
  let complete = false;
  let failed = false;
  let canceled = false;
  let iter : ReturnType<typeof extractAudio> | null = null;
  (async () => {
    console.log("Extracting audio...");
    let fullPath = generateVariationPath("mp3");
    let path = dirname(fullPath);

    await fs.mkdir(path, { recursive: true });

    if (canceled) return;

    let filePath = $selectedVariation?.path ?? $selectedVideos[0].path;
    iter = extractAudio(filePath, fullPath);

    for await (let update of iter) {
      console.warn(update);
      progress = update.progressPercent;
    }
    progress = 100;
    complete = true;

    // If the output file doesnt exist, the command failed
    failed = !(await fs
      .access(fullPath)
      .then(() => true)
      .catch(() => false));

    if (failed) {
      console.log("Failed to extract audio!");
      return;
    }
    if (canceled) {
      await fs.unlink(fullPath);
      return;
    }

    let variationName = "Audio";
    let i = 1;
    while ($selectedVideos[0].variations.find((v) => v.name == variationName)) {
      variationName = "Audio " + i++;
    }

    let previousActions = $selectedVariation?.actions ?? [];

    $selectedVideos[0].variations.push({
      actions: [...previousActions, { type: "extractAudio" }],
      name: variationName,
      path: fullPath,
    });
    $selectedVideos = $selectedVideos;
    console.log("Done extracting audio");
  })();

  function done() {
    $activeAction = false;
  }
  function cancel() {
    iter?.cancel();
    canceled = true;
    done();
  }
</script>

<div class="wrapper">
  <LoadingBar failed="{failed}" progress="{progress}" />
  {#if complete}
    <button on:click="{done}">Done</button>
  {:else}
    <button on:click="{cancel}">Cancel</button>
  {/if}
</div>
