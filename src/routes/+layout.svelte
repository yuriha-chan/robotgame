<script>
  import "../app.pcss";
  import Header from "./Header.svelte";
  import "./styles.css";
</script>

<div class="app">
  <Header></Header>
  <main>
    <slot />
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    width: 100%;
  }
</style>
