<style>
  * {
    border-radius: 0px;
    background-color: #36393f;
    border: none;
    color: white;
  }
  .autocomplete {
    margin-bottom: 8px;
    position: relative;
    display: inline-block;
  }
  select {
    flex: 1;
    margin: 0px;
  }
  input {
    width: 100%;
    margin: 0px;
  }
  :focus-visible {
    outline: none;
  }
  .autocomplete-items {
    position: absolute;
    border-bottom: none;
    z-index: 99;
    /*position the autocomplete items to be the same width as the container:*/
    top: 100%;
    left: 0;
    right: 0;
    /* Hide suggestions unless overwritten below */
    display: none;
  }
  .autocomplete:focus-within > .autocomplete-items {
    display: inherit;
  }
  .autocomplete-item {
    border: 1px solid gray;
    border-top: none;
    top: 100%;
    left: 0;
    right: 0;
    padding: 10px;
    z-index: 99;
    cursor: pointer;
  }
  .autocomplete-item:first-child {
    border-top: 1px solid gray;
  }
</style>

<script lang="ts">
  import { db, tagForName } from "./database";
  import { selectedVideos } from "./stores";

  function videoHasTag(name: string) {
    return $selectedVideos[0].tags.some((t) => t.name == tagForName(name).name);
  }

  function generateSuggestions() {
    suggestedTags = db.tags.filter((x) => x.name.includes(input) && !videoHasTag(x.name)).slice(0, 7);
  }

  function addTag(ev: KeyboardEvent) {
    let elem = ev.target as HTMLInputElement;

    if (ev.key == "Escape") {
      // Deselect input on ESC pressed
      elem.blur();
    }

    if (ev.key != "Enter") return;

    let input = elem.value.trim();
    if (input == "") return;

    let tag = tagForName(input);

    if (videoHasTag(tag.name)) return;

    $selectedVideos[0].tags.push(tag);
    $selectedVideos = $selectedVideos;
    elem.value = "";
    input = "";

    generateSuggestions();
  }

  // TODO: make suggestedTags properly reactive (use stores in db?)
  // TODO: useful tag suggestion sorting
  let input: string = "";
  $: suggestedTags = db.tags.filter((x) => x.name.includes(input) && !videoHasTag(x.name)).slice(0, 7);

  // TODO: Arrow key & enter navigation for suggestions
  type TagClickHandler = svelteHTML.MouseEventHandler<HTMLDivElement>;
  const tagSuggestionClicked: TagClickHandler = (evt) => {
    let tag = tagForName(evt.currentTarget.innerHTML);
    if (videoHasTag(tag.name)) return;

    $selectedVideos[0].tags.push(tag);
    $selectedVideos = $selectedVideos;
    generateSuggestions();
  };
</script>

{#if $selectedVideos}
  <div class="autocomplete">
    <input bind:value="{input}" on:keydown="{addTag}" type="text" />
    <div class="autocomplete-items">
      {#each suggestedTags as tag}
        <div class="autocomplete-item" on:mousedown="{tagSuggestionClicked}">{tag.name}</div>
      {/each}
    </div>
  </div>
  <select multiple>
    {#each $selectedVideos[0].tags as tag}
      <option>{tag.name}</option>
    {/each}
  </select>
{/if}
