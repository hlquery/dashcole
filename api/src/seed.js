import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { controlSequelize, primarySequelize, redis } from './database.js';
import { runFakerSeed } from './seed-lib.js';

const isMain = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMain) {
  const wipeFirst = process.argv.includes('--wipe');
  runFakerSeed({ wipeFirst })
    .catch((error) => {
      console.error('No fue posible generar los datos iniciales:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      if (redis.isOpen) await redis.quit();
      await primarySequelize.close();
      if (controlSequelize !== primarySequelize) await controlSequelize.close();
    });
}
