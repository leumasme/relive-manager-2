<style>
  * {
    border-radius: 0px;
    background-color: #36393f;
    border: none;
    color: white;
  }
  :focus-visible {
    outline: none;
  }
  select {
    flex: 1;
    width: 100%;
    flex-grow: 1;
    margin: 0px;
  }
</style>

<script lang="ts">
  import { selectedVariation, selectedVideos } from "../stores";
  import fs from "fs/promises";

  type OnSelectHandler = svelte.JSX.ChangeEventHandler<HTMLSelectElement>;
  let onChange: OnSelectHandler = (evt) => {
    $selectedVariation = $selectedVideos[0].variations.find((v) => v.path == evt.currentTarget.value) ?? null;
    console.log("Selected Variation", $selectedVariation);
  };

  type OnKeydownHandler = svelte.JSX.KeyboardEventHandler<HTMLSelectElement>;
  let onKeydown: OnKeydownHandler = async (evt) => {
    let target = evt.currentTarget;
    if (evt.key == "Delete") {
      try {
        await fs.unlink(target.value);
        if ($selectedVariation?.path == target.value) $selectedVariation = null;
        $selectedVideos[0].variations = $selectedVideos[0].variations.filter((t) => t.path != target.value);
      } catch (e) {
        alert("Failed to delete variation file! " + JSON.stringify(e));
      }
    }
  };
</script>

{#if $selectedVideos}
  <select size="3" on:change="{onChange}" on:keydown="{onKeydown}">
    <option value="">Original</option>
    {#each $selectedVideos[0].variations as variation}
      <option value="{variation.path}">{variation.name}</option>
    {/each}
  </select>
{/if}
