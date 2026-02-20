<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import { selectedVideos, selectedVariation, activeTasks } from "../stores";
  import { MuteAudioTask } from "../ffmpeg/muteAudio";
  import ActionStatusDisplay from "../ActionStatusDisplay.svelte";

  export let activeAction: Writable<SvelteComponent | false>;

  let task = new MuteAudioTask($selectedVideos[0], $selectedVariation);
  activeTasks.add(task);
  task.execute().then(() => {
    console.log("Done muting audio");
  });

  function done() {
    $activeAction = false;
  }
</script>

<ActionStatusDisplay task="{task}" done="{done}" />
