<script>
export let target;
</script>
{#if !$target.picked}
<circle class="obj" cx="{$target.x}" cy="{$target.y}" r="1"/>
{/if}
<style>
.obj {
		fill: #fa2;
		stroke: #222;
		stroke-width: 0.2;
	}
</style>
