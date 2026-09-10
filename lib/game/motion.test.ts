import test from 'node:test';
import assert from 'node:assert/strict';
import {idleMotion,advanceMotion,walkFrame} from './motion.ts';
test('walking cycles through distinct frames, stops when movement stops and keeps facing',()=>{let motion=idleMotion();const frames=new Set<number>();for(let i=0;i<8;i++){motion=advanceMotion(motion,24,0);frames.add(walkFrame(motion));}assert.equal(frames.size,4);assert.equal(motion.facing,2);motion=advanceMotion(motion,0,0);assert.equal(motion.moving,false);assert.equal(motion.facing,2);assert.equal(walkFrame(motion),1);});
test('animation follows traveled distance regardless of frame rate and handles all directions',()=>{let slow=idleMotion(),fast=idleMotion();for(let i=0;i<60;i++)slow=advanceMotion(slow,0,-4);for(let i=0;i<30;i++)fast=advanceMotion(fast,0,-8);assert.equal(walkFrame(slow),walkFrame(fast));assert.equal(slow.facing,3);assert.equal(advanceMotion(slow,-2,0).facing,1);assert.equal(advanceMotion(slow,0,2).facing,0);});
