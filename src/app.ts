import 'dotenv/config';
import debug from 'debug';

if (!process.env.DEBUG) process.exit(1);

const log = debug(process.env.DEBUG);
