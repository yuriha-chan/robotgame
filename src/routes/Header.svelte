<script>
	import { page } from '$app/stores';
  import i18n from './i18n.json';
</script>

<header>
	<div class="title">
  <span class="header-item">{i18n.title}</span>
	</div>

	<nav>
		<ul>
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
        {#if $page.url.pathname === '/'}
        <span class="header-item">{i18n.editor}</span>
        {:else}
				<span class="header-item"><a href="/">{i18n.editor}</a></span>
        {/if}
			</li>
			<li aria-current={$page.url.pathname === '/documentation' ? 'page' : undefined}>
        {#if $page.url.pathname === '/documentation'}
        <span class="header-item">{i18n.documentation}</span>
        {:else}
				<span class="header-item"><a href="/documentation">{i18n.documentation}</a></span>
        {/if}
			</li>
		</ul>
	</nav>
</header>

<style>
  header {
		font-size: 0.8rem;
		background: rgba(255, 255, 255, 1.0);
    box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.1);
    z-index: 500;
  }

	.title {
    font-weight: 700;
    display: inline-block;
    font-size: 1.0rem;
	}

	nav {
		display: inline-block;
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
	}

	li {
		position: relative;
		height: 100%;
	}


	nav a {
		color: var(--color-text);
		transition: color 0.2s linear;
	}

  .header-item {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		font-weight: 400;
  }

	li[aria-current='page'] .header-item {
    border-bottom: 2px solid var(--color-theme-1);
  }

	li[aria-current='page'] .header-item {
		font-weight: 700;
	}

	a:hover {
		color: var(--color-theme-1);
	}


</style>
