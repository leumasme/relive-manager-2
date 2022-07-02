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
    let input = (ev.target as HTMLInputElement).value.trim();
    if (input == "") return;

    let tag = tagForName(input);

    if ($selectedVideo!.tags.find((t) => t.name == tag.name)) return;

    $selectedVideo!.tags.push(tag);
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
