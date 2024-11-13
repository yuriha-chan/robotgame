import { writable } from 'svelte/store';
const _direction = ((x, y, a, b) => Math.atan2((y - b), (x - a)));
const distance = ((x, y, a, b) => Math.sqrt((x - a)**2 + (y - b)**2));
const degrees = ((rad) => ((rad / Math.PI * 180 + 180 * 5) % 360) - 180);
const radians = ((deg) => deg / 180 * Math.PI);
const direction = ((x, y, a, b) => degrees(_direction(x, y, a, b)));

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

export const createSimulator = function () {
  // API for eval
  const watch = function (k, v) {
    if (!dic[k]) {
      dic[k] = writable(v);
    } else {
      dic[k].set(v);
    }
  };
  let dic = {};
  let robot = { onTick: function () {}, position: {}, pick: function () { this.__doPick = true }, dump: function () { this.__doDump = true } };
  let time;
  const noop = function () {};
  const simulator = {
    watch: function () {
      return dic;
    },
    noop: function () {
      return watch;
    },
    init: function (userCode, seed, aOnRobotUpdated, aOnRoomInitialized, onWatchUpdated, onComplete=noop) {
      time = 0;
      eval(userCode);
      this.simulatorImpl = simulatorImpl();
      this.simulatorImpl.init(seed, aOnRobotUpdated, aOnRoomInitialized, onWatchUpdated);
      this.onComplete = onComplete;
    },
    evaluate: function (userCode, onComplete, onProgress) {
      const results = [];
      const impl = simulatorImpl();
      this.simulatorImpl = impl;
      const seed = 10000;
      const _evaluate = (i) => {
        time = 0;
        onProgress(i);
        if (i >= 100) {
          onComplete(results);
        } else {
          this.onComplete = (points) => {
            results.push(points);
            _evaluate(i+1); };
          eval(userCode);
          impl.init(seed + i, noop, noop, noop);
          this.start();
        }
      }
      _evaluate(0);
    },
    step: function () {
      for (let s = 0; s < this.stepsPerInterval; s++) {
        if (time > this.end) {
          this.halt();
          this.onComplete(this.points());
          return;
        }
        this.simulatorImpl.preTick(robot);
        robot.onTick();
        this.simulatorImpl.postTick(robot);
        time += 0.03125;
      }
    },
    start: function () {
      dic = {};
      if (!this.running) {
        this.interval = setInterval(() => this.step(), 10 / this.speedFactor);
        this.running = true;
      }
    },
    halt: function () {
      if (this.running) {
        clearInterval(this.interval);
        this.running = false;
      }
    },
    changeSpeedFactor: function (factor) {
      this.speedFactor = factor;
      if (this.running) {
        this.halt();
        this.start();
      }
    },
    points: function () {
      return this.simulatorImpl.points();
    },
    end: 500,
    stepsPerInterval: 1,
    speedFactor: 1,
    running: false,
    time: () => time,
  };
  return simulator;
};


const simulatorImpl = function () {
	let walls = [];
	let targets = [];
  let time = 0;
  const d = distance;
  const dir = ((x, y, a, b) => radians(direction(x, y, a, b)));
	const dt = 0.03125;
	function distanceToRect(x, y, w, h, t, qx, qy) {
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
       this.radius = 3;
     }
		
     tick(dt) {
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
					let x = ((5*Math.PI + this.nearTargets[0].direction - this.q[2]) % (2 * Math.PI)) - Math.PI;
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
  let onRobotUpdated, onRoomInitialized, onWatchUpdated;
	
	function preTick(robotData) {
		let nearWalls = [];
		let blockingWalls = [];
		let nearTargets = [];
		for (let j = 0; j < walls.length; j++) {
				const w = walls[j];
				const dist = distanceToRect(w[0], w[1], w[2], w[3], w[4]*Math.PI/180, robot.q[0], robot.q[1]);
				if (dist < 6) {
					let x = angle(w[0], w[1], w[2], w[3], w[4]*Math.PI/180, robot.q[0], robot.q[1]);
					nearWalls.push({ distance: Math.max(0, dist - robot.radius), direction: degrees(x - robot.q[2]) });
					if (dist < robot.radius) {
						blockingWalls.push([dist, x]);
				}
			}
		}
		robot.nearWalls = nearWalls;
		robotData.nearWalls = nearWalls;
		robot.pickableTarget = false;
		
		for (let j = 0; j < targets.length; j++) {
				const t = targets[j].value;
				const dist = Math.max(0, d(t.x, t.y, robot.q[0], robot.q[1])-robot.radius);
				if (dist < 3 && !t.picked) {
					nearTargets.push({ distance: Math.max(0, dist), direction: degrees(dir(t.x, t.y, robot.q[0], robot.q[1]) - robot.q[2]) });
				}
				if (dist == 0 && !t.picked) {
					robot.pickableTarget = targets[j];
				}
		}
		robot.nearTargets = nearTargets;
    robotData.nearTargets = nearTargets;
		for (let i = 0; i < blockingWalls.length; i++) {
			const w = blockingWalls[i];
			const diff = (robot.q[2] - w[1] + 8 * Math.PI) % (2 * Math.PI);
			if (diff < 0.5 * Math.PI || diff > 1.5 * Math.PI) {
				robot.stop();
			}
		}
    // copy data to eval scope
		robotData.position.x = robot.q[0];
		robotData.position.y = robot.q[1];
		robotData.direction = degrees(robot.q[2]);
    robotData.v = robot.v;
    robotData.w = degrees(robot.w);
    robotData.__doPick = false;
    robotData.__doDump = false;
  }

  function postTick(robotData) {
    // copy data from user scope
    if (robotData.v > 10) {
      robotData.v = 10;
    } else if (robotData.v > 0) {
      robotData.v = robotData.v;
    } else {
      robotData.v = 0;
    }
    if (robotData.w > 15) {
      robotData.w = 15;
    } else if (robotData.w >= -15) {
      robotData.w = robotData.w;
    } else if (robotData.w < -15){
      robotData.w = -15;
    } else {
      robotData.w = 0;
    }
    robot.v = robotData.v;
    robot.w = radians(robotData.w);
    if (robotData.__doPick) {
      robot.pick();
    } else if (robotData.__doDump) {
      robot.dump();
    }
    // do robot simulation
		robot.tick(dt);
    onRobotUpdated(robot);
    onWatchUpdated();
	}
	
	function init(seed, procA, procB, procC) {
    onRobotUpdated = procA;
    onRoomInitialized = procB;
    onWatchUpdated = procC;
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
				const dist = distanceToRect(w[0], w[1], w[2], w[3], w[4]*Math.PI/180, p.x, p.y);
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
    onRoomInitialized(walls, targets);
	}
  function points() {
    return targets
      .map(t => (-10 <= t.value.x && t.value.x <= 10  && -10 <= t.value.y && t.value.y <= 10))
      .reduce((s, v) => s + v, 0);
  }
  return { init, preTick, postTick, points };
};
