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
    overflow: none;
  }
  .flex {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>

<script lang="ts">
  import { db } from "./database";
  import FileList from "./FileList.svelte";
  import ModalList from "./ModalList.svelte";
  import SplitPane from "./SplitPane.svelte";
  import Studio from "./Studio.svelte";
    import TaskList from "./TaskList.svelte";

  console.log("This is start count #" + db.startCount++);
</script>

<main>
  <div class="wrapper">
    <SplitPane type="horizontal" min="{20}" max="{50}" pos="{20}">
      <section class="flex" slot="a" style="height:100%; background-color: #252526">
        <FileList />
        <TaskList />
        <ModalList />
      </section>
      <section slot="b" style="height: 100%; background-color: #1E1E1E">
        <Studio />
      </section>
    </SplitPane>
  </div>
</main>
