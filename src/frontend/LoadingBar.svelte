<style>
  .loadwrapper {
    display: flex;
    background-color: gray;
    margin-bottom: 16px;
  }
  .loadinner {
    background-color: green;
    height: 25px;
  }
  .failed {
    background-color: red;
  }
</style>

<script lang="ts">
  export let progress: number;
  export let failed: boolean;
</script>

<div class="loadwrapper">
  <div class="loadinner" class:failed="{failed}" style="width:{progress}%;"></div>
</div>
