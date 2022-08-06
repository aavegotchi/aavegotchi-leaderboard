import 'dotenv/config';
import debug from 'debug';
import jetpack from 'fs-jetpack';
import { gql, GraphQLClient } from 'graphql-request';
import setInfo from './setList.js';

if (!process.env.DEBUG) process.exit(1);

const log = debug(process.env.DEBUG);

const winnerRange = 7_500;
const season = 3;
const round = 4;
const block_number = 27404025;
const subgraphUrl =
	'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic';

const client = new GraphQLClient(subgraphUrl);

const allGotchiInfo = async () => {
	const maxSupply = 25_000;
	let queryStr = '';
	for (let i = 0; i < maxSupply / 1_000; i++) {
		queryStr += gql` data${i}:aavegotchis(block: {number: ${block_number}} first:1000 where: {
            id_gt: ${i * 1_000},
            id_lte: ${i * 1000 + 1000}
            baseRarityScore_gt: 0
        } orderBy:id) {
            id
            equippedWearables
            modifiedRarityScore
            modifiedNumericTraits
            kinship
            experience
        } `;
	}

	const info = await client.request(gql`{${queryStr}}`);
	const gotchis: {
		id: number;
		kinship: number;
		equippedWearables: number[];
		experience: number;
		baseRarityScore: number;
		modifiedRarityScore: number;
		modifiedNumericTraits: number[];
	}[][] = Object.values(info);
	return Object.fromEntries(gotchis.flat().map((data) => [data.id, data]));
};

const allSetsForItems = (items: number[]): number[] => {
	const matchingSets = setInfo
		.map(({ wearableIds }, index) => {
			// ! @TODO
			const includesSet = wearableIds.every((num) => items.includes(num));
			if (includesSet) return index;
			return 0;
		})
		.filter((data) => data != 0);
	if (matchingSets.length > 0)
		log(`these items`, items, `match these sets`, matchingSets);
	return matchingSets;
};

const bestSetOfSets = (sets: number[]): number => {
	const rawBoosts = sets.map((setIndex) => {
		return setInfo[setIndex].traitsBonuses.reduce(
			(curr, next) => curr + Math.abs(next),
			0,
		);
	});

	const findMax = (arr: number[]) => {
		let max = 0;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] > max) {
				max = arr[i];
			}
		}
		return max;
	};

	const maxNum = findMax(rawBoosts);

	const bestSetIndex = sets[rawBoosts.indexOf(maxNum)];

	return bestSetIndex;
};

const returnRarity = (number: number) => {
	if (number < 50) return 100 - number;
	else return number + 1;
};

const rarityScoreBonus = (traits: number[]): number => {
	return traits.reduce((curr, next) => curr + returnRarity(next), 0);
};

const main = async () => {
	const gotchiData = await allGotchiInfo();

	const gotchiToSets = Object.fromEntries(
		Object.entries(gotchiData).map((info) => {
			const sets = allSetsForItems(info[1].equippedWearables);
			return [info[0], sets];
		}),
	);

	const gotchiBestSetTraitsRarityScore = Object.fromEntries(
		Object.entries(gotchiToSets).map(([key, sets]) => {
			const currentGotchiInfo = gotchiData[key];
			if (sets.length == 0)
				return [
					key,
					{
						...currentGotchiInfo,
						rarity: gotchiData[key].modifiedRarityScore,
						setTraits: gotchiData[key].modifiedNumericTraits,
					},
				];

			const best = bestSetOfSets(sets);
			const bestSetInfo = setInfo[best];
			const bestSetTraitBoots = bestSetInfo.traitsBonuses.slice(
				1,
				bestSetInfo.traitsBonuses.length,
			);

			const gotchiSetFinalTraits = currentGotchiInfo.modifiedNumericTraits.map(
				(trait: number, index: number) => {
					if (index >= 4) return trait;
					return trait + bestSetTraitBoots[index];
				},
			);

			const setsTraitsRarityScore = rarityScoreBonus(gotchiSetFinalTraits);
			const bonusDifference =
				setsTraitsRarityScore -
				rarityScoreBonus(currentGotchiInfo.modifiedNumericTraits);

			const bestSetBrsBoost = bestSetInfo.traitsBonuses[0];

			const finalRarity =
				Number(currentGotchiInfo.modifiedRarityScore) +
				bonusDifference +
				bestSetBrsBoost;

			return [
				key,
				{
					...currentGotchiInfo,
					rarity: finalRarity,
					setTraits: gotchiSetFinalTraits,
					bestSetInfo,
				},
			];
		}),
	);

	type Result = {
		id: number;
		kinship: number;
		equippedWearables: number[];
		experience: number;
		baseRarityScore: number;
		modifiedRarityScore: number;
		modifiedNumericTraits: number[];
		rarity: number;
		setTraits: number[];
	};

	const tiebreaker = (
		a: Result,
		b: Result,
		type: 'rarity' | 'kinship' | 'experience',
	) => {
		// no tiebreaker
		if (a[type] != b[type]) return b[type] - a[type];
		// trait tiebreaker
		const tiebreakerIndex = round - 1;
		return b.setTraits[tiebreakerIndex] - a.setTraits[tiebreakerIndex];
	};

	const finalRoundScores = {
		rarity: Object.values(gotchiBestSetTraitsRarityScore)
			.sort((a, b) => tiebreaker(a, b, 'rarity'))
			.slice(0, winnerRange),
		kinship: Object.values(gotchiBestSetTraitsRarityScore)
			.sort((a, b) => tiebreaker(a, b, 'kinship'))
			.slice(0, winnerRange),
		experience: Object.values(gotchiBestSetTraitsRarityScore)
			.sort((a, b) => tiebreaker(a, b, 'experience'))
			.slice(0, winnerRange),
	};

	// log(
	// 	finalRoundScores,
	// 	finalRoundScores.rarity[0],
	// 	gotchiBestSetTraitsRarityScore[19095],
	// );

	await jetpack.writeAsync(
		`data/s${season}/${round}/${block_number}/${Date.now()}.json`,
		finalRoundScores,
	);
};

main();
