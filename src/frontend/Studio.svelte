<style>
  h1 {
    margin-top: 0;
  }
  .container {
    display: grid;
    overflow: none;
    grid-template-columns: 1fr 14em;
    grid-template-rows: max-content 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      ". ."
      ". .";
  }
  .wrap {
    display: flex;
    flex-direction: column;
  }
  .wrap > select {
    flex: 1;
    margin: 0px;
  }
  .wrap > * {
    border-radius: 0px;
    background-color: #36393F;
    color: white;
  }
</style>

<script lang="ts">
  import { tagForName } from "./database";

  import { selectedVideo } from "./stores";

  $: filePath = $selectedVideo?.path;

  function addTag(ev: KeyboardEvent) {
    if (ev.key != "Enter") return;
    let tag = ev.target as HTMLInputElement;
    if (tag.value == "") return;

    if ($selectedVideo!.tags.find((t) => t.name.toLowerCase() == tag.value.toLowerCase())) return;

    $selectedVideo!.tags.push(tagForName(tag.value));
    $selectedVideo = $selectedVideo;
  }
</script>

{#if $selectedVideo}
  <!-- svelte-ignore a11y-media-has-caption -->
  <div class="container">
    <video controls width="100%" src="{filePath}"></video>
    <div class="wrap" style="padding:10px">
      <input on:keydown="{addTag}" type="text" />
      <select multiple style="width:100%">
        {#each $selectedVideo.tags as tag}
          <option>{tag.name}</option>
        {/each}
      </select>
    </div>
    <i>Actions</i>
    <i>Variations</i>
  </div>
{:else}
  <h1>Select a Video...</h1>
{/if}
