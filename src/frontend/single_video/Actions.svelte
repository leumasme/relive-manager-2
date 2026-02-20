<style>
  .wrapper {
    margin: 8px;
    display: flex;
    justify-content: left;
  }
  .wrapper > button {
    margin: 8px;
  }
  .hidden {
    display: none;
  }
</style>

<script lang="ts">
  import type { ComponentType } from "svelte";
  import { writable } from "svelte/store";
  import { selectedVideos, selectedVariation } from "../stores";
  import { ensureAudioStreams } from "../ffmpeg/ffprobe";
  import type { AudioStreamMeta } from "../database";
  import DeleteAction from "./DeleteAction.svelte";
  import ExtractAudioAction from "./ExtractAudioAction.svelte";
  import ExportAction from "./ExportAction.svelte";
  import TrimAction from "./TrimAction.svelte";
  import ReduceSizeAction from "./ReduceSizeAction.svelte";
  import MuteAudioAction from "./MuteAudioAction.svelte";
  let activeAction = writable<ComponentType | false>(false);

  // Audio stream metadata for the currently selected video/variation.
  // undefined = not yet probed, null = probe failed
  let audioStreams: AudioStreamMeta[] | undefined | null = undefined;

  // Probe audio streams whenever the selected video/variation changes
  $: {
    const target = $selectedVariation ?? $selectedVideos[0];
    if (target) {
      audioStreams = undefined;
      ensureAudioStreams(target)
        .then((streams) => {
          // Guard against stale results if selection changed during probe
          const current = $selectedVariation ?? $selectedVideos[0];
          if (current === target) audioStreams = streams;
        })
        .catch(() => {
          const current = $selectedVariation ?? $selectedVideos[0];
          if (current === target) audioStreams = null;
        });
    }
  }

  $: hasAudio = audioStreams?.length !== 0;

  // TODO: Handle switching video/variation while an action is open/running

  function actionDelete() {
    $activeAction = DeleteAction;
  }
  function actionExtractSound() {
    $activeAction = ExtractAudioAction;
  }
  function actionOpenExplorer() {
    $activeAction = ExportAction;
  }
  function actionTrim() {
    $activeAction = TrimAction;
  }
  function actionReduceSize() {
    $activeAction = ReduceSizeAction;
  }
  function actionMuteAudio() {
    $activeAction = MuteAudioAction;
  }
</script>

<div class="wrapper" class:hidden="{$activeAction}">
  <button on:click="{actionDelete}"> Delete </button>
  {#if hasAudio}
    <button on:click="{actionExtractSound}"> Extract Audio </button>
    <button on:click="{actionMuteAudio}"> Mute Audio </button>
  {/if}
  <button on:click="{actionOpenExplorer}"> Export </button>
  <button on:click="{actionTrim}"> Trim </button>
  <button on:click="{actionReduceSize}"> Reduce Size </button>
</div>
{#if $activeAction}
  <svelte:component this="{$activeAction}" {...{ activeAction }} />
{/if}
