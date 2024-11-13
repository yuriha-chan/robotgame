<script>
	import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { Range, Label, Input, Button } from 'flowbite-svelte';
	import Target from './Target.svelte';
  import i18n from './i18n.json';
	class Random {
	  constructor(seed = 88675123) {
	    this.x = 123456789;
	    this.y = 362436069;
	    this.z = 521288629;
	    this.w = seed;
	  }
	  // XorShift
	  next() {
	    let t;
	    t = this.x ^ (this.x << 11);
	    this.x = this.y; this.y = this.z; this.z = this.w;
	    this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
			return (this.w / (1 << 31) + 1) / 2;
	  }
	}
	let walls = [];
	let targets = [];
	let watch = {};
	let time = 0;
	const dt = 0.0625;
	const d = ((x, y, a, b) => Math.sqrt((x - a)**2 + (y - b)**2));
	function distance(x, y, w, h, t, qx, qy) {
		let px = Math.cos(t)*qx + Math.sin(t)*qy;
		let py = -Math.sin(t)*qx + Math.cos(t)*qy;
		px = px - x;
		py = py - y;
		const ret =
		 	(px < 0) ?
				((py < 0) ?
					 d(px, py, 0, 0) :
				 (py < h) ?
					 -px :
				 // h <= py
					 d(px, py, 0, h)) :
			(px < w) ?
				((py < 0) ?
					-py :
				 (py < h) ?
				 	0 :
				 // h <= py
					 py - h) :
			// w <= px
				((py < 0) ?
					d(px, py, w, 0) :
				 (py < h) ?
				 	px - w :
				 // h <= py
					d(px, py, w, h));
		return ret;
	}
	const dir = ((x, y, a, b) => Math.atan2((y - b), (x - a)));
	function angle(x, y, w, h, t, qx, qy) {
		let px = Math.cos(t)*qx + Math.sin(t)*qy;
		let py = -Math.sin(t)*qx + Math.cos(t)*qy;
		px = px - x;
		py = py - y;
		const ret =
		 	(px < 0) ?
				((py < 0) ?
					 dir(0, 0, px, py) :
				 (py < h) ?
					 0 :
				 // h <= py
					 dir(0, h, px, py)) :
			(px < w) ?
				((py < 0) ?
					0.5 * Math.PI :
				 (py < h) ?
				 	0 :
				 // h <= py
					1.5 * Math.PI) :
			// w <= px
				((py < 0) ?
					dir(w, 0, px, py) :
				 (py < h) ?
				 	Math.PI :
				 // h <= py
					-dir(w, h, px, py));
		return ret + t;
	}
	
	class Robot {
     constructor() {
			 this.v = 10;
			 this.w = 0.5;
       this.p = [0, 0, 0];
       this.q = [0, 0, 0.5 * Math.PI];
       this.dp = [0, 0, 0];
			 this.picked = false;
			 this.pickableTarget = false;
     }
		
     tick(dt) {
			 this.think();
       this.q[0] += dt * this.p[0];
       this.q[1] += dt * this.p[1];
       this.q[2] += dt * this.p[2];
			 this.q[2] = (2 * Math.PI + this.q[2]) % (2 * Math.PI);
       this.p[0] = Math.cos(this.q[2]) * this.v;
       this.p[1] = Math.sin(this.q[2]) * this.v;
       this.p[2] = this.w;
     }
		
			think(){
				if (Math.abs(this.q[0]) < 9 && Math.abs(this.q[1]) < 9) {
					this.dump();
				} else if (Math.abs(this.q[0]) > 12 || Math.abs(this.q[1]) > 12) {
					this.pick();					
				}
				this.v = 10;
				if (this.nearTargets[0] && !this.picked && (Math.abs(this.q[0]) > 15 || Math.abs(this.q[1]) > 15)) {
					let x = ((5*Math.PI + this.nearTargets[0][1] - this.q[2]) % (2 * Math.PI)) - Math.PI;
					if (x < 0) {
						this.w = -0.5
					} else {
						this.w = 0.5
					}
				if (Math.abs(x)>0.2*Math.PI) {
					this.v = 3;
				} else {
					this.v = 10;
				}
					this.v = 2;
				} else {
					this.v = 10;
				}
				if (this.picked && this.nearWalls.length == 0) {
				let o = dir(0, 0, this.q[0], this.q[1]);
				let x = (((Math.PI*9) + o - this.q[2]) % (2 * Math.PI)) - Math.PI;
				if (x < 0){
					this.w = -0.5;
				} else {
					this.w = 0.5;
				}
				if (Math.abs(x)>0.4*Math.PI) {
					this.v = 3;
				} else {
					this.v = 10;
				}
				}
			}
		 stop() {
			 this.p[0] = 0;
			 this.p[1] = 0;
		 }
		 pick() {
			 if (this.pickableTarget && !this.picked) {
				 this.picked = this.pickableTarget;
				 this.pickableTarget.value.picked = true;
				 this.pickableTarget.writable.update(
					 (value) => ({ ...value, picked: true}));
			 }
		 }
		dump() {
			if (this.picked) {
				this.picked.picked = false;
				let value = { x: this.q[0], y: this.q[1], picked: false};
				this.picked.writable.set(value);
				this.picked.value = value;
				this.picked = false;
			}
		}
	}
	
	let robot = new Robot();
	let rx, ry, rt;
	let wallDistance = 100, targetDistance = 100;
	let ntx, nty;
	
	function tick() {
		let nearWalls = [];
		let blockingWalls = [];
		let nearTargets = [];
		for (let j = 0; j < walls.length; j++) {
				const w = walls[j];
				const dist = distance(w[0], w[1], w[2], w[3], w[4]*Math.PI/180, robot.q[0], robot.q[1]);
				if (dist < 6) {
					let x = angle(w[0], w[1], w[2], w[3], w[4]*Math.PI/180, robot.q[0], robot.q[1]);
					nearWalls.push([dist, x]);
					if (dist < 3) {
						blockingWalls.push([dist, x]);
				}
			}
		}
		robot.nearWalls = nearWalls;
		robot.pickableTarget = false;
		
		for (let j = 0; j < targets.length; j++) {
				const t = targets[j].value;
				const dist = Math.max(0, d(t.x, t.y, robot.q[0], robot.q[1])-3);
				if (dist < 3) {
					nearTargets.push([dist, dir(t.x, t.y, robot.q[0], robot.q[1])]);
				}
				if (dist == 0) {
					robot.pickableTarget = targets[j];
				}
		}
		robot.nearTargets = nearTargets;
		for (let i = 0; i < blockingWalls.length; i++) {
			const w = blockingWalls[i];
			const diff = (robot.q[2] - w[1] + 8 * Math.PI) % (2 * Math.PI);
			if (diff < 0.5 * Math.PI || diff > 1.5 * Math.PI) {
				robot.stop();
			}
		}
		robot.tick(dt);
		rx = robot.q[0];
		ry = robot.q[1];
		rt = robot.q[2];
		watch.distance = nearTargets[0] && nearTargets[0][0];
		watch.angle =  nearTargets[0] && 180 / Math.PI * nearTargets[0][1];
		wallDistance = Math.min(100, ...nearWalls.map((x) => x[0] - 3));
		targetDistance = Math.min(100, ...nearTargets.map((x) => x[0]));
	}
	
	function setRoom(seed) {
		time = 0;
		let random = new Random(seed);
		walls = [];
		targets = [];
		robot = new Robot();
		for (let i = 0; i < 10+5*random.next(); i++) {
			walls[i] = [5*(random.next()), -30*(random.next()+0.4), 15*(random.next()+1), 3*(random.next()+1), 60*(i+3*random.next())]
		}
		walls.push([-50, 45, 100, 5, 0]);
		walls.push([-50, -50, 100, 5, 0]);
		walls.push([-50, 45, 100, 5, 90]);
		walls.push([-50, -50, 100, 5, 90]);
		
		for (let i = 0; i < 30; ) {
			let p = {x: 100*(random.next()-0.5), y: 100*(random.next()-0.5)};
			if (Math.abs(p.x) < 15 && Math.abs(p.y) < 15) continue;
			let discard = false;
			for (let j = 0; j < walls.length; j++) {
				const w = walls[j];
				const dist = distance(w[0], w[1], w[2], w[3], w[4]*Math.PI/180, p.x, p.y);
				if (dist < 3) {
					discard = true;
					break;
				}
			}
			if (discard) continue;
			for (let j = 0; j < i; j++) {
				if (d(p.x, p.y, targets[j].value.x, targets[j].value.y) < 4) {
					discard = true;
					break;
				}
			}
			if (discard) continue;
			p.picked = false;
			targets[i] = {value: p, writable: writable(p)};
			i++;
		}
	}
	let seed = 3;
	$: watch.seed = seed;
	$: watch.robot = Math.floor(rt * 180 / Math.PI);
	let simulationTimer;
	let logSimulationSpeed;
	let simulationSpeed;
	$: changeLogSimulationSpeed(logSimulationSpeed);
	function changeLogSimulationSpeed(logfactor) {
			simulationSpeed = 2**logfactor;
			changeSimulationSpeed(simulationSpeed);
	}
	function changeSimulationSpeed(factor) {
		clearInterval(simulationTimer);
		simulationTimer = setInterval(() => {
		  tick();
			time = time + dt;
			if (time > 300) {
				seed = seed + 1;
				setRoom(seed);
			}
			
		}, 10 / factor);
	}
	onMount(() => {
		setRoom(seed);
		changeSimulationSpeed(1);

		return () => {
			clearInterval(interval);
			clearInterval(simulationTimer);
		};
	});
	function format(value) {
		if (value === value+0 && value !== Math.floor(value)) {
			return value.toFixed(2);
		}
		return value;
	}
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
		<rect class="wall" x="{wall[0]}" y="{wall[1]}" width="{wall[2]}" height="{wall[3]}" transform="rotate({wall[4]})" />
	{/each}
	<g transform="translate({rx} {ry}) rotate({180*rt/Math.PI})">
	<circle class="censor wall" cx="0" cy="0" r="5" opacity="{0.2*(3-wallDistance)}"/>
	<circle class="censor target" cx="0" cy="0" r="4" opacity="{0.1*(4-targetDistance)}"/>
	<circle class="robot" cx="0" cy="0" r="3"/>
	<circle class="eye" cx="{2}" cy="{0.6}" r="0.45"/>
	<circle class="eye" cx="{2}" cy="{-0.6}" r="0.45"/>
	{#if robot.picked}
	<circle class="target" cx="{0}" cy="{0}" r="1"/>
	{/if}
	</g>
</g>
</svg>
<div>
<Label>Simulation speed</Label>
<Range id="range1" min="-5" max="5" bind:value={logSimulationSpeed}/>
</div>
<div class="entry"><span class="tag">{i18n.time}</span> <span class="value">{time.toFixed(2)}</span><Button>{i18n.halt}</Button></div>
<div class="entry"><span class="tag">{i18n.randomSeed}</span><Label>{i18n.randomSeed}</Label><Input type="number" placeholder="0"/><Button>{i18n.change}</Button></div>
<h2>watch values</h2>
<table>
{#each Object.keys(watch) as k}
	<tr class="entry"><td class="tag">{k}</td><td class="value">{format(watch[k])}</td></tr>
{/each}
</table>
<h2>テスト結果</h2>
<table>
	<tr><td>コード</td></tr>
	<tr><td>平均得点</td></tr>
	<tr><td>最高得点</td></tr>
	<tr><td>最低得点</td></tr>
</table>
<input type="button" value="ロボットを提出"/>

<style>
	h2 {
		margin: 5px;
		padding: 0;
		font-size: 120%;
	}
	svg {
		max-width: 400px;
		min-width: 200px;
	}
	.wall {
		fill: rgba(0, 0, 0, 0.3)
	}
	.wall.censor{
		fill: #86a;
	}
	.target.censor {
		fill: #f90;
	}

	.robot {
		fill: #6cf;
		stroke: #555;
		stroke-width: 0.2;
	}
	.eye {
		fill: #fff;
	}
	.target {
		fill: #fa2;
		stroke: #222;
		stroke-width: 0.2;
	}
	.value {
		font-family: Monaco, Consolas, monospace;
		font-size: 130%;
		padding: 2px;
		text-align: right;
		min-width: 9em;
	}
	.tag {
		padding: 2px;
		font-weight: bold;
		background-color: #a50;
		color: #fff;
		border-radius:4px;
	}
	.entry {
		background-color: #fda;
		border-radius: 4px;
		padding: 2px;
	}
</style>
