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
  import type { SvelteComponent } from "svelte";
  import { writable } from "svelte/store";
  import DeleteAction from "./DeleteAction.svelte";
  import ExtractAudioAction from "./ExtractAudioAction.svelte";
  import ExportAction from "./ExportAction.svelte";
  import TrimAction from "./TrimAction.svelte";
  import ReduceSizeAction from "./ReduceSizeAction.svelte";
  let activeAction = writable<typeof SvelteComponent | false>(false);

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
</script>

<div class="wrapper" class:hidden="{$activeAction}">
  <button on:click="{actionDelete}"> Delete </button>
  <button on:click="{actionExtractSound}"> Extract Audio </button>
  <button on:click="{actionOpenExplorer}"> Export </button>
  <button on:click="{actionTrim}"> Trim </button>
  <button on:click="{actionReduceSize}"> Reduce Size </button>
</div>
{#if $activeAction}
  <svelte:component this="{$activeAction}" {...{ activeAction }} />
{/if}
