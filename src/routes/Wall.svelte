<script>
export let wall;
</script>
<rect class="wall" x="{wall[0]}" y="{wall[1]}" width="{wall[2]}" height="{wall[3]}" transform="rotate({wall[4]})" />
<style>
.wall {
	fill: rgba(0, 0, 0, 0.3)
}
</style>
