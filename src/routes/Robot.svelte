<script>
export let robot;
</script>
<g class="robot" transform="translate({$robot.x} {$robot.y}) rotate({180 * $robot.t/Math.PI})">
	<circle class="censor wall" cx="0" cy="0" r="5" opacity="{0.2*(3-$robot.wallDistance)}"/>
	<circle class="censor target" cx="0" cy="0" r="4" opacity="{0.2*(4-$robot.targetDistance)}"/>
	<circle class="robot-body" cx="0" cy="0" r="3"/>
	<circle class="eye" cx="{2}" cy="{0.6}" r="0.45"/>
	<circle class="eye" cx="{2}" cy="{-0.6}" r="0.45"/>
	{#if $robot.picked}
	  <circle class="target" cx="{0}" cy="{0}" r="1"/>
	{/if}
</g>
<style>
	.robot-body {
		fill: #6cf;
		stroke: #555;
		stroke-width: 0.2;
	}

	.eye {
		fill: #fff;
	}

	.wall.censor{
		fill: #86a;
	}

	.target.censor {
		fill: #f90;
	}
  .target {
		fill: #fa2;
		stroke: #222;
		stroke-width: 0.2;
	}
</style>
