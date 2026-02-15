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
  import DeleteAllAction from "./DeleteAllAction.svelte";
  let activeAction = writable<ComponentType | false>(false);

  // TODO: Handle switching video/variation while an action is open/running

  function actionDelete() {
    $activeAction = DeleteAllAction;
  }
</script>

<div class="wrapper" class:hidden="{$activeAction}">
  <button on:click="{actionDelete}"> Delete All </button>
</div>
{#if $activeAction}
  <svelte:component this="{$activeAction}" {...{ activeAction }} />
{/if}
