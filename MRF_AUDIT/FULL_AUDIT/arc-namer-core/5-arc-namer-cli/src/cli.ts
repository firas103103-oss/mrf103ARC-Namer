// This file contains the command-line interface logic for the arc ecosystem.

import { Command } from 'commander';
import { version } from '../package.json';

const program = new Command();

program
  .version(version)
  .description('CLI for the Arc Ecosystem')
  .option('-n, --name <name>', 'Specify the name for the arc')
  .action((options) => {
    if (options.name) {
      console.log(`Arc name specified: ${options.name}`);
    } else {
      console.log('No arc name specified.');
    }
  });

program.parse(process.argv);