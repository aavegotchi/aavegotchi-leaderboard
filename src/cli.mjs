#!/usr/bin/env node
import Table from 'cli-table3';
import jetpack from 'fs-jetpack';
import gradient from 'gradient-string';
import ora from 'ora';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { leaderboard, seasonRoundBlockSnapshots } from './app.js';

const tintStr = gradient('rgb(107, 37, 231)', 'rgb(250, 52, 243)');
const warnStr = gradient('rgb(250, 52, 243)', 'rgb(107, 37, 231)');
console.log(
	tintStr(
		` 
 ▄▀█ ▄▀█ █ █ █▀▀ █▀▀ █▀█ ▀█▀ █▀▀ █ █ █
 █▀█ █▀█ ▀▄▀ ██▄ █▄█ █▄█  █  █▄▄ █▀█ █`,
	),
	`\n`,
	`https://app.aavegotchi.com/leaderboard`,
	`\n`,
);

const cli = async () => {
	const args = yargs(hideBin(process.argv))
		.usage('Usage: $0 [options]')
		.example('$0 --rarity-season 4 --round 1')
		.example('$0 -s 4 -r 1')
		.alias('h', 'help')
		.options({
			r: {
				alias: 'rarity_round',
				demandOption: true,
				default: 1,
				choices: [1, 2, 3, 4],
				desc: 'round of rarity farming, for tiebreaker',
			},
			b: {
				alias: 'block_number',
				type: 'number',
				desc: 'block number to fetch from',
			},
			s: {
				alias: 'rarity_season',
				type: 'number',
				desc: 'rarity season, for historical tags',
			},
			a: {
				alias: 'address',
				type: 'string',
				desc: 'filter results matching owner',
			},
			p: {
				alias: 'preview',
				type: 'string',
				choices: ['rarity', 'kinship', 'experience', 'all'],
				desc: 'preview results in the cli, does not export',
			},
			t: {
				alias: 'top',
				hidden: true,
				default: 7_500,
				type: 'number',
				desc: 'length of top results to return',
			},
		})
		.parse();
	const { rarity_season, rarity_round, block_number } = args;
	let queryBlock = block_number;
	if (rarity_season) {
		// if requesting a season's round, if snapshot taken force that block number
		const newBlock = seasonRoundBlockSnapshots(rarity_season, rarity_round);
		if (newBlock && newBlock > 0) queryBlock = newBlock;
	}
	const spinner = ora(`fetching leaderboard 
   SEASON: ${warnStr(rarity_season)} ROUND: ${warnStr(rarity_round)} 
   BLOCK_NUMBER: ${warnStr(queryBlock ?? 'latest')}`);
	spinner.spinner = {
		interval: 80,
		frames: ['👻', '⏳', '👻'],
	};
	spinner.color = 'magenta';
	spinner.start();

	const origResults = await leaderboard(
		rarity_round,
		rarity_season,
		queryBlock,
		args.t,
	);
	spinner.stop();

	let results = origResults;

	if (args.a) {
		// filtering for specific address rankings
		console.log(warnStr(`✔️`) + `rankings for ${args.a}`);
		args.a = args.a.toLowerCase();
		results = {
			...results,
			rarity: results.rarity.filter(
				(data) => data.owner.id.toLowerCase() === args.a.toLowerCase(),
			),
			kinship: results.kinship.filter(
				(data) => data.owner.id.toLowerCase() === args.a.toLowerCase(),
			),
			experience: results.experience.filter(
				(data) => data.owner.id.toLowerCase() === args.a.toLowerCase(),
			),
		};
	}

	if (args.p) {
		// print preview to cli
		const makeTable = (field) => {
			field = field.toLowerCase();
			const t = new Table({
				head: ['rank', 'name (token)', 'owner', field].map((str) => warnStr(str)),
				// colWidths: [100, 250, 200],
			});
			t.push(
				...results[field]
					.slice(0, 10)
					.map((data, index) => [
						origResults[field].indexOf(data) + 1,
						`${data.name} (#${data.id})`,
						data.owner.id.slice(0, 4) + '...' + data.owner.id.slice(-4),
						data[field],
					]),
			);
			console.log(t.toString());
		};
		if (args.p.toLowerCase() === 'all')
			['rarity', 'kinship', 'experience'].map(makeTable);
		else makeTable(args.p);
	} else {
		// if not previewing, save data
		const path = `data/s_${rarity_season}/r_${rarity_round}/block_${
			results.block.number
		}/t_${Date.now()}.json`;
		await jetpack.writeAsync(path, results);
		console.log(warnStr(`✔️`) + ` Leaderboard results saved to ${warnStr(path)}`);
	}
};

cli();
