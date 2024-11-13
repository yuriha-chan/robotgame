<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { EditorView, keymap, lineNumbers } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { indentWithTab } from "@codemirror/commands"
  import { ViewPlugin } from '@codemirror/view';
  import { javascript } from '@codemirror/lang-javascript';
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
  import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
  import { tomorrow } from 'thememirror';
  import { currentCode, defaultCode } from './repository.js';

  let editor;

  const largeFont = EditorView.theme({
    "&": {
      fontSize: "15pt"
    },
    ".cm-content": {
      fontFamily: 'Consolas',
      fontWeight: "500",
    },
    ".cm-lineNumbers": {
      fontFamily: 'Consolas',
      fontWeight: "400",
      minWidth: "4ch",
    },
    ".cm-scroller": {
      width: "calc(70svw - 7px)",
      height: "calc(100svh - 2.5rem)",
    },
  });
  function localStorageExtension() {
    return ViewPlugin.fromClass(class {
      update(e) {
        if (e.docChanged) {
          const text = e.state.doc.toString();
          $currentCode = text;
          localStorage.setItem('currentCode', text);
        }
      }
    });
  }

  onMount(() => {
    const savedText = localStorage.getItem('currentCode') || defaultCode;
    $currentCode = savedText;
    const extensions = [
      javascript(),
      history(),
      lineNumbers(),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([defaultKeymap, historyKeymap, indentWithTab]),
      tomorrow,
      largeFont,
      localStorageExtension(),
    ];

    const state = EditorState.create({
      extensions,
      doc: savedText,
    });

    const view = new EditorView({
      state,
    });

    document.querySelector('#editor').append(view.dom)
  });
</script>

<div id="editor" />
<style>
#editor {
  height: calc(100svh - 4.5rem);
}
</style>
