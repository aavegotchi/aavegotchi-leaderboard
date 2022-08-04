import 'dotenv/config';
import debug from 'debug';
import { gql, GraphQLClient } from 'graphql-request';
import setInfo from './setList';

if (!process.env.DEBUG) process.exit(1);

const log = debug(process.env.DEBUG);

const subgraphUrl =
	'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic';

const client = new GraphQLClient(subgraphUrl);

const allGotchiInfo = async () => {
	const maxSupply = 25_000;
	let queryStr = '';
	for (let i = 0; i < maxSupply / 1_000; i++) {
		queryStr += gql` data${i}:aavegotchis(first:1000 where: {
            id_gt: ${i * 1_000},
            id_lte: ${i * 1000 + 1000}
        } orderBy:id) {
            id
            equippedWearables
            modifiedRarityScore
        } `;
	}

	const info = await client.request(gql`{${queryStr}}`);
	return Object.fromEntries(
		Object.values(info)
			.flat()
			// @ts-ignore
			.map((data) => [data.id, data]),
	);
};

const main = async () => {
	const res = await allGotchiInfo();
	log(`gotchi res`, res);
};

main();
