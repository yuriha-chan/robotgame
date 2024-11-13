<script>
	import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { Range, Label, Input, AccordionItem, Accordion, Button } from 'flowbite-svelte';
	import Target from './Target.svelte';
	import Wall from './Wall.svelte';
	import Robot from './Robot.svelte';
	import Watch from './Watch.svelte';
  import i18n from './i18n.json';
  import { createSimulator } from './Simulator.js';
  import { currentCode } from './repository.js';
  let simulator = createSimulator();	
	let logSimulationSpeed;
	let simulationSpeed;
  let seed;
  let time = 0;
  let robots = [];
  let targets = [];
  let walls = [];
  let watch = {};
  let points = 0;
  let running = false;
  let progress = 0;
  let results = [];
  let evaluating = false;
  const accordionOpen = [ true, false ];
	$: changeLogSimulationSpeed(logSimulationSpeed);
	function changeLogSimulationSpeed(logfactor) {
			simulationSpeed = 2**logfactor;
			changeSimulationSpeed(simulationSpeed);
	}
	function changeSimulationSpeed(factor) {
    simulator.changeSpeedFactor(factor);
	}
  const start = function() {
		simulator.init($currentCode, seed, onRobotUpdated, onRoomInitialized, onWatchUpdated);
    simulator.start();
    running = true;
  };
  const halt = function() {
    simulator.halt();
    running = false;
  };
  const resume = function() {
    simulator.start();
    running = true;
  }
  const onCompleted = function(r) {
    results = r;
    evaluating = false;
  };
  const onProgress = function(p) {
    progress = p;
  }
  const submit = function() {
    if (evaluating) return;
    const evaluator = createSimulator();
    evaluator.speedFactor = 1000;
    evaluator.stepsPerInterval = 512;
    evaluator.evaluate($currentCode, onCompleted, onProgress);
    accordionOpen[0] = false;
    accordionOpen[1] = true;
    evaluating = true;
  };
	onMount(() => {
		return () => {
      halt();
		};
	});
  const onRoomInitialized = function(ws, ts) {
      robots = [writable({x: 0, y: 0, t: 0, wallDistance: 100, targetdistance: 100, picked: false })];
      walls = ws;
      targets = ts;
  };
  const onRobotUpdated = function(robot) {
      robots[0].update((value) => ({
        x: robot.q[0],
        y: robot.q[1],
        t: robot.q[2],
        wallDistance: Math.min(100, ...robot.nearWalls.map((x) => x.distance)),
        targetDistance: Math.min(100, ...robot.nearTargets.map((x) => x.distance)),
        picked: !!robot.picked,
      }));
      time = simulator.time();
  };
  const onWatchUpdated = function() {
    watch = simulator.watch();
    points = simulator.points();
  };
</script>
<svg viewBox="-50 -50 100 100">
	<defs>
    <pattern id="hatchPattern" patternUnits="userSpaceOnUse" width="2" height="2">
      <line x1="0" y1="0" x2="10" y2="10" stroke="black" stroke-width="0.2" />
      <line x1="0" y1="2" x2="2" y2="0" stroke="black" stroke-width="0.2" />
    </pattern>
  </defs>
	<g transform="scale(1, -1)">
	<rect x="-10" y="-10" width="20" height="20" style="fill:url(#hatchPattern); opacity: 0.2" />
	{#each targets as target}
		<Target target={target.writable} />
	{/each}
	{#each walls as wall}
    <Wall wall={wall} />
	{/each}
	{#each robots as robot}
		<Robot robot={robot} />
  {/each}
	</g>
</svg>
<div>
<div class="control">
<Label>Simulation speed</Label>
<Range id="range1" min="-5" max="5" bind:value={logSimulationSpeed}/>
</div>
<div class="entry"><span class="tag">{i18n.time}</span> <span class="value">{time.toFixed(2)}</span>
{#if running}
<button on:click={halt} class="button">{i18n.halt}</button>
{:else}
<button on:click={resume} class="button">{i18n.resume}</button>
{/if}
</div>
<div class="entry"><span class="tag">{i18n.points}</span><span class="value">{points}</span></div>
<div class="entry"><span class="tag">{i18n.randomSeed}</span><input class="seedInput" type="number" bind:value={seed}/></div>
<div class="buttons"><button class="run button" on:click={start}>{i18n.run}</button><button class="submit button" on:click={submit}>{i18n.submitRobot}</button></div>
</div>
<Accordion>
<AccordionItem bind:open={accordionOpen[0]} paddingDefault="p-1">
<span slot="header">Watch</span>
{#each Object.keys(watch) as k}
<Watch key={k} value={watch[k]}/>
{/each}
</AccordionItem>
<AccordionItem bind:open={accordionOpen[1]} paddingDefault="p-1">
<span slot="header">{i18n.evaluation}</span>
<div class="entry"><span class="tag">{i18n.progress}</span><span class="value">{ progress }%</span></div>
<div class="entry"><span class="tag">{i18n.averagePoints}</span><span class="value">{ results.reduce((a, b) => a + b, 0) / 100 }</span></div>
<div class="entry"><span class="tag">{i18n.bestPoints}</span><span class="value">{ results.reduce((a, b) => a < b ? b : a, 0) }</span></div>
<div class="entry"><span class="tag">{i18n.worstPoints}</span><span class="value">{ results.reduce((a, b) => a < b ? a : b, 100) }</span></div>
</AccordionItem>
</Accordion>
<style>
	svg {
		max-width: 80svw;
		min-width: 20svw;
	}
  .buttons {
    background-color: white;
    padding: 5px;
    display: flex;
    justify-content: space-between;
  }
  .run, .run:active:hover {
    outline: thick double #0033ee !important;
    margin: 8px 12px;
  }
  .submit, .submit:active:hover {
    outline: thick double #ffee00 !important;
    margin: 8px 12px;
  }
  .control {
    padding: 0;
    margin: 0;
  }
  .button {
    border-width: medium;
    font-weight: bold;
    outline-offset: 2px;
    letter-spacing: 0.3em;
    padding-left: 0.5em;
    padding-right: 0.2em;
    background-color: #eee;
    border-top: 3px solid #ccc;
    border-bottom: 5px solid #777;
    border-right: 4px solid #bbb;
    border-left: 3px solid #ddd;
  }
  .button:active:hover {
    background-color: #ddd;
    border-top: 5px solid #888;
    border-bottom: 3px solid #eee;
    border-right: 3px solid #ccc;
    border-left: 4px solid #bbb;
  }
	.value {
		font-family: Monaco, Consolas, monospace;
		font-size: 130%;
		padding: 4px;
		text-align: right;
	}
	.tag {
		padding: 2px;
		font-weight: bold;
		background-color: #a50;
		color: #fff;
		border-radius:4px;
	}
	.entry {
		background-color: #ebe0b7;
		border-radius: 4px;
		padding: 2px;
    display: flex;
    justify-content: space-between;
	}
  .seedInput {
    width: 8ch;
    padding: 3px;
    margin: 0px 4px 0px;
  }
</style>
