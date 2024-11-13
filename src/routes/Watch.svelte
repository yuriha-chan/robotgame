<script>
  export let key;
  export let value;
	function format(value) {
		if (value === value+0 && value !== Math.floor(value)) {
			return value.toFixed(2);
		}
		return value;
	}
</script>
<div class="entry"><span class="tag">{key}</span><span class="value">{format($value)}</span></div>
<style>
.value {
	font-family: Monaco, Consolas, monospace;
	font-size: 130%;
	padding: 2px;
	text-align: right;
}
.tag {
	padding: 4px;
	font-weight: bold;
	background-color: #a50;
	color: #fff;
	border-radius:4px;
}
.entry {
  display: flex;
  justify-content: space-between;
	border-radius: 4px;
	padding: 2px;
	background-color: #ebe0b7;
}
div:has(.entry) {
  padding: 0 !important;
}
</style>
