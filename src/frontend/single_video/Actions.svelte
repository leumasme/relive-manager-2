<style>
  .wrapper {
    margin: 8px;
    display: flex;
    justify-content: left;
  }
  .hidden {
    display: none;
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import { writable } from 'svelte/store';
  import DeleteAction from './DeleteAction.svelte';
  let activeAction = writable<typeof SvelteComponent | false>(false);
  function actionDelete() {
    $activeAction = DeleteAction;
  }
</script>

<div class="wrapper" class:hidden="{$activeAction}">
  <button on:click="{actionDelete}">
    Delete
  </button>
</div>
{#if $activeAction}
  <svelte:component this={$activeAction} {...{activeAction}}/>
{/if}