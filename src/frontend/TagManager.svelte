<style>
  select {
    flex: 1;
    margin: 0px;
  }
  * {
    border-radius: 0px;
    background-color: #36393f;
    border: none;
    color: white;
  }
</style>

<script lang="ts">
  import { tagForName } from "./database";

  import { selectedVideo } from "./stores";

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
  <input on:keydown="{addTag}" type="text" />
  <select multiple style="width:100%">
    {#each $selectedVideo.tags as tag}
      <option>{tag.name}</option>
    {/each}
  </select>
{/if}
