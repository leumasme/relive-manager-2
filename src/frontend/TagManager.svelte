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
  import { selectedVideo } from "./stores";

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

    if ($selectedVideo!.tags.find((t) => t.name == tag.name)) return;

    $selectedVideo!.tags.push(tag);
    $selectedVideo = $selectedVideo;
    elem.value = "";
    input = "";
    suggestedTags = db.tags.filter((x) => x.name.includes(input)).slice(0, 7);
  }

  // TODO: make suggestedTags properly reactive (use stores in db?)
  // TODO: useful tag suggestion sorting
  let input: string = "";
  $: suggestedTags = db.tags.filter((x) => x.name.includes(input)).slice(0, 7);

  // TODO: Arrow key & enter navigation for suggestions
  type TagClickHandler = svelteHTML.MouseEventHandler<HTMLDivElement>;
  const tagSuggestionClicked: TagClickHandler = (evt) => {
    console.log("Yay")
    let tag = tagForName(evt.currentTarget.innerHTML);
    if ($selectedVideo!.tags.some((t) => t.name == tag.name)) return;

    $selectedVideo!.tags.push(tag);
    $selectedVideo = $selectedVideo;
  };
</script>

{#if $selectedVideo}
  <div class="autocomplete">
    <input bind:value="{input}" on:keydown="{addTag}" type="text" />
    <div class="autocomplete-items">
      {#each suggestedTags as tag}
        <div class="autocomplete-item" on:mousedown="{tagSuggestionClicked}">{tag.name}</div>
      {/each}
    </div>
  </div>
  <select multiple style="width:100%">
    {#each $selectedVideo.tags as tag}
      <option>{tag.name}</option>
    {/each}
  </select>
{/if}
