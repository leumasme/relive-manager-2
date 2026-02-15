<style>
  .wrapper {
    padding: 16px;
  }
  .title {
    margin-top: 0;
  }
  .stream-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 8px 0;
  }
  .stream-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .stream-option label {
    cursor: pointer;
  }
  .error {
    color: var(--color-error);
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { onDestroy } from "svelte";
  import { selectedVideos, selectedVariation, activeTasks } from "../stores";
  import { ExtractAudioTask, type AudioExtractMode } from "../ffmpeg/extractAudio";
  import { ensureAudioStreams } from "../ffmpeg/ffprobe";
  import ActionStatusDisplay from "../ActionStatusDisplay.svelte";

  export let activeAction: Writable<SvelteComponent | false>;

  let task: ExtractAudioTask;
  let streams: { codec: string }[] | null = null;
  let probeError: string | null = null;
  let selectedMode: "merge" | number = "merge"; // "merge" or stream audioIndex
  let destroyed = false;
  onDestroy(() => { destroyed = true; });

  const target = $selectedVariation ?? $selectedVideos[0];

  // Use cached audio stream metadata, or probe if not yet cached
  ensureAudioStreams(target)
    .then((result) => {
      if (destroyed) return;
      streams = result;
      if (streams.length === 0) {
        probeError = "No audio streams found in this file.";
      } else if (streams.length === 1) {
        // Only one stream — start immediately
        executeTask({ type: "single" });
      } else {
        // Default to picking the first stream
        selectedMode = 0;
      }
    })
    .catch((err) => {
      if (destroyed) return;
      probeError = "Failed to probe audio streams: " + err.message;
    });

  async function executeTask(mode: AudioExtractMode) {
    console.log("Extracting audio with mode:", mode);
    task = new ExtractAudioTask($selectedVideos[0], $selectedVariation, mode);
    activeTasks.add(task);
    await task.execute();
    console.log("Done extracting audio");
  }

  function start() {
    let mode: AudioExtractMode;
    if (selectedMode === "merge") {
      mode = { type: "merge", streamCount: streams!.length };
    } else {
      mode = { type: "pick", streamIndex: selectedMode };
    }
    executeTask(mode);
  }

  function done() {
    $activeAction = false;
  }
</script>

{#if task}
  <ActionStatusDisplay task="{task}" done="{done}" />
{:else if probeError}
  <div class="wrapper">
    <p class="error">{probeError}</p>
    <button on:click="{done}">Close</button>
  </div>
{:else if streams === null}
  <div class="wrapper">
    Detecting audio streams...
    <button on:click="{done}">Cancel</button>
  </div>
{:else if streams.length > 1}
  <div class="wrapper">
    <p class="title">This file has {streams.length} audio streams. Choose how to extract:</p>
    <div class="stream-list">
      <div class="stream-option">
        <input type="radio" id="mode-merge" bind:group="{selectedMode}" value="merge" />
        <label for="mode-merge">Merge all streams</label>
      </div>
      {#each streams as stream, i}
        <div class="stream-option">
          <input type="radio" id="mode-stream-{i}" bind:group="{selectedMode}" value="{i}" />
          <label for="mode-stream-{i}">Stream {i + 1}: {stream.codec}</label>
        </div>
      {/each}
    </div>
    <button on:click="{start}">Extract</button>
    <button on:click="{done}">Cancel</button>
  </div>
{/if}
