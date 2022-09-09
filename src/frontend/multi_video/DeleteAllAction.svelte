<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { selectedVideos } from "../stores";
  export let activeAction: Writable<SvelteComponent | false>;

  // TODO: Implement deletion when no longer indev

  function deleteYes() {
    console.log("Deleted videos", $selectedVideos);
    $activeAction = false;
  }
  function deleteNo() {
    console.log("Cancelled deletion");
    $activeAction = false;
  }
</script>

<h3>Are you sure you want to delete <i style="color: #aaa">{$selectedVideos.length}</i> Videos?</h3>
<button on:click="{deleteYes}">Yes</button>
<button on:click="{deleteNo}">No</button>
