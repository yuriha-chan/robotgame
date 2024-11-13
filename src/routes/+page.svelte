<script>
	import Editor from './Editor.svelte';
	import Display from './Display.svelte';
  import i18n from './i18n.json';
  function resize(element) {
    const right = element.children[2];
    const divider = element.children[1];
    let initialWidth = 300, initialPos = 0, dividerPos = 0;
    let resizing = false;

    function onMouseDownRight(event) {
		  const rect = right.getBoundingClientRect()
      const threashold = 12;
      if (event.changedTouches[0].clientX - rect.x < threashold) {
        onMouseDown(event);
      }
    }
 	  function onMouseDown(event) {
      resizing = true;
      if (event.cancelable) {
        event.preventDefault();
      }
      event.stopPropagation();
		  const rect = right.getBoundingClientRect()
    	divider.classList.add('active')
      initialWidth = rect.width;
		  initialPos = event.pageX || event.changedTouches[0].pageX;
	  }
    function onMouseUp(event) {
      resizing = false;
    	divider.classList.remove('active')
    	initialPos = null
    }
    divider.addEventListener('mousedown', onMouseDown);
    divider.addEventListener('touchstart', onMouseDown);
    right.addEventListener('touchstart', onMouseDownRight);
    function onMove(event) {
      const scroller = element.querySelector(".cm-scroller");
      const editor = element.querySelector(".cm-editor");
      if (!resizing) return;
			const delta = event.pageX - initialPos;
			right.style.width = `${initialWidth - delta}px`;
			scroller.style.width = `calc(100svw - ${initialWidth - delta}px - 7px)`;
			editor.style.width = `calc(100svw - ${initialWidth - delta}px - 7px)`;
		}
    function onTouchMove(event) {
      onMove(event.changedTouches[0]);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
  }
</script>

<svelte:head>
	<title>{i18n.title} : {i18n.editor}</title>
	<meta name="description" content="{i18n.description}" />
	<meta name="viewport" content="width=device-width, initial-scale=0.8" />
</svelte:head>

<div class="pane-container" use:resize>
  <div class="pane"><Editor /></div>
  <div class="divider"></div>
  <div class="pane" id="simulator-pane" style="width: 30svw"><Display /></div>
</div>

<style>
  .pane-container {
    display: flex;
    padding: 0;
    margin: 0;
    flex-direction: row;
    max-height: calc(100svh - 2.5rem);
  }

  .pane {
    padding: 0; margin: 0;
    height: calc(100svh - 2.5rem);
    overflow: clip;
  }

  .divider {
    width: 5px;
    min-width: 5px;
    height: calc(100svh - 2.5rem);
    background-color: #eeeeee;
    border-left: 1px solid #000;
    border-right: 1px solid #000;
    cursor: col-resize;
    overflow: clip;
  }

  #simulator-pane {
    width: 300px;
    height: calc(100svh - 2.5rem);
    overflow: auto;
  }

  @media screen and (max-width: 767px) {
    #simulator-pane, .pane {
      height: calc(100svh - 4.0rem);
    }
    .divider {
      height: calc(100svh - 4.0rem);
    }
    .pane-container {
      max-height: calc(100svh - 4.0rem);
    }
  }
</style>
