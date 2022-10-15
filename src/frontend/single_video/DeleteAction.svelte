<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { selectedVideos, selectedVariation } from "../stores";
  export let activeAction: Writable<SvelteComponent | false>;
  let targetName = $selectedVariation?.name ?? $selectedVideos[0].name;

  // TODO: Implement deletion when no longer indev

  function deleteYes() {
    console.log("Deleted video", $selectedVideos[0]);
    $activeAction = false;
  }
  function deleteNo() {
    console.log("Canceled deletion");
    $activeAction = false;
  }
</script>

<h3>Are you sure you want to delete <i style="color: #aaa">{targetName}</i>?</h3>
<button on:click="{deleteYes}">Yes</button>
<button on:click="{deleteNo}">No</button>
