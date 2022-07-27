<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { selectedVideo } from "../stores";
  export let activeAction: Writable<SvelteComponent | false>;

  function deleteYes() {
    console.log("Deleted video", $selectedVideo);
    $activeAction = false;
  }
  function deleteNo() {
    console.log("Cancelled deletion");
    $activeAction = false;
  }
</script>

<h3>Are you sure you want to delete <i style="color: #aaa">{$selectedVideo?.name}</i>?</h3>
<button on:click="{deleteYes}">Yes</button>
<button on:click="{deleteNo}">No</button>
