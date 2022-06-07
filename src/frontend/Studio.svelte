<style>
  h1 {
    margin-top: 0;
  }
</style>

<script lang="ts">
  import type { ParsedPath } from "path";
  
  export let selectedFile: ParsedPath | null = null;
  $: filePath = selectedFile?.dir + "/" + selectedFile?.base;
</script>
{#if selectedFile}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video controls width=100% src={filePath}></video>
{:else}
  <h1>Select a Video...</h1>
{/if}
