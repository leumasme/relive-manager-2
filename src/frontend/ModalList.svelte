<style>
  .wrapper {
    display: flex;
  }
  .svgbtn {
    cursor: pointer;
  }
</style>

<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import Modal from "./Modal.svelte";
  import SettingsModal from "./SettingsModal.svelte";

  let bla: typeof SvelteComponent;
  function settingsClick() {
    bla = SettingsModal;
  }
</script>

<div class="wrapper">
  <img on:click="{settingsClick}" class="svgbtn" src="/icons/settings.svg" alt="settings" width="32" />
</div>
<Modal show="{bla}" />
