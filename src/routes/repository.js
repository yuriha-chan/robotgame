import { writable } from 'svelte/store';
export const currentCode = writable("");
export const defaultCode = `robot.onTick = function() {
  if (time % 120 < 60) {
    robot.v = 10;
    robot.w = 10;
  } else {
    robot.v = 10;
    robot.w = -10;
  }
　if (Math.abs(robot.position.x) < 10 && Math.abs(robot.position.y) < 10) {
    robot.dump();
  } else {
    robot.pick();
  }
};`
