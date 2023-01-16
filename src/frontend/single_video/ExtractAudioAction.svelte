<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { selectedVideos, selectedVariation, activeTasks } from "../stores";
  import { ExtractAudioTask } from "../ffmpeg/extractAudio";
  import ActionStatusDisplay from "../ActionStatusDisplay.svelte";

  export let activeAction: Writable<SvelteComponent | false>;

  let task = new ExtractAudioTask($selectedVideos[0], $selectedVariation);
  console.log("Extracting audio");
  activeTasks.add(task);
  task.execute().then(() => {
    console.log("Done extracting audio");
  });

  function done() {
    $activeAction = false;
  }
</script>

<ActionStatusDisplay task="{task}" done="{done}" />
