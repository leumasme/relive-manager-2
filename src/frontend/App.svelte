<style>
  main {
    text-align: center;
    max-width: 240px;
    margin: 0;
    padding: 0;
  }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  div.wrapper {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
  .fullsize {
    width: 100%;
    height: 100%;
  }
</style>

<script lang="ts">
  import { HSplitPane } from "svelte-split-pane";
  import { db } from "./database";
  import FileList from "./FileList.svelte";
  import Studio from "./Studio.svelte";

  console.log("This is start count #" + db.startCount++);
</script>

<main>
  <div class="wrapper">
    <HSplitPane minLeftPaneSize="15ch" leftPaneSize="20ch" minRightPaneSize="50%" rightPaneSize="calc(100vw - 20ch)">
      <section slot="left" class="fullsize" style="background-color: #252526">
        <FileList />
      </section>
      <section slot="right" class="fullsize" style="background-color: #1E1E1E">
        <Studio />
      </section>
    </HSplitPane>
  </div>
</main>
