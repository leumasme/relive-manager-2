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
  let activeAction = writable<typeof SvelteComponent | false>(false);
  function actionDelete() {
    $activeAction = DeleteAction;
  }
  function actionExtractSound() {
    $activeAction = ExtractAudioAction;
  }
</script>

<div class="wrapper" class:hidden="{$activeAction}">
  <button on:click="{actionDelete}"> Delete </button>
  <button on:click="{actionExtractSound}"> Extract Audio </button>
</div>
{#if $activeAction}
  <svelte:component this="{$activeAction}" {...{ activeAction }} />
{/if}
