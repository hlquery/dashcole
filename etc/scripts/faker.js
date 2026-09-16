#!/usr/bin/env node

import { controlSequelize, primarySequelize, redis } from '../../api/src/database.js';
import { runFakerSeed } from '../../api/src/seed-lib.js';

const wipeFirst = process.argv.includes('--wipe');
runFakerSeed({ wipeFirst })
  .catch((error) => {
    console.error('No fue posible ejecutar Faker:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (redis.isOpen) await redis.quit();
    await primarySequelize.close();
    if (controlSequelize !== primarySequelize) await controlSequelize.close();
  });
