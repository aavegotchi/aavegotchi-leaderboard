import 'dotenv/config';
import debug from 'debug';
import { gql, GraphQLClient } from 'graphql-request';
import setInfo from './setList.js';

if (!process.env.DEBUG) process.exit(1);

const log = debug(process.env.DEBUG);

const subgraphUrl =
	'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic';

const client = new GraphQLClient(subgraphUrl);

const winnerRange = 7_500;
const round = 1;

const traitRoundTiebreaker = (traitsA: number[], traitsB: number[]) => {
	const tiebreakerIndex = round - 1;
	return traitsA[tiebreakerIndex] - traitsB[tiebreakerIndex];
};

const allGotchiInfo = async () => {
	const maxSupply = 25_000;
	let queryStr = '';
	for (let i = 0; i < maxSupply / 1_000; i++) {
		queryStr += gql` data${i}:aavegotchis(first:1000 where: {
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
	return Object.fromEntries(
		Object.values(info)
			.flat()
			// @ts-ignore
			.map((data) => [data.id, data]),
	);
};

const allSetsForItems = (items: number[]): number[] => {
	const matchingSets = setInfo
		.map(({ wearableIds }, index) => {
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
	log(`gotchi res`, gotchiData);

	const gotchiToSets = Object.fromEntries(
		Object.entries(gotchiData).map((info) => {
			// @ts-ignore
			const sets = allSetsForItems(info[1].equippedWearables);
			const best = bestSetOfSets(sets);
			if (sets.length > 1) log(`best set was: `, best, `of`, sets);
			return [info[0], sets];
		}),
	);

	const gotchiBestSetTraitsRarityScore = Object.fromEntries(
		Object.entries(gotchiToSets).map(([key, sets]) => {
			if (sets.length == 0)
				return [
					key,
					{
						id: key,
						finalRarityScore: gotchiData[key].modifiedRarityScore,
						finalTraits: gotchiData[key].modifiedNumericTraits,
					},
				];

			const best = bestSetOfSets(sets);
			const bestSetInfo = setInfo[best];
			const bestSetBrsBoost = bestSetInfo.traitsBonuses[0];

			const currentGotchiInfo = gotchiData[key];

			const gotchiSetFinalTraits = currentGotchiInfo.modifiedNumericTraits.map(
				(trait: number, index: number) => {
					if (index >= 4) return trait;
					// traitsBonuses: [brs, nrg, agg, spk, brn]
					return trait + bestSetInfo.traitsBonuses[index + 1];
				},
			);

			// ! @TODO: boostDifference?

			const gotchiSetFinalRarityScore =
				rarityScoreBonus(gotchiSetFinalTraits) + bestSetBrsBoost;

			return [
				key,
				{
					id: key,
					finalRarityScore: gotchiSetFinalRarityScore,
					finalTraits: gotchiSetFinalTraits,
				},
			];
			// return []
		}),
	);

	const finalRoundScores = {
		rarity: Object.values(gotchiBestSetTraitsRarityScore)
			.sort((a, b) => {
				// @ts-ignore
				return b.finalRarityScore - a.finalRarityScore;
			})
			.slice(0, winnerRange),
		kinship: Object.values(gotchiData)
			.sort((a, b) => {
				// @ts-ignore
				return b.kinship - a.kinship;
			})
			.slice(0, winnerRange),
		experience: Object.values(gotchiData)
			.sort((a, b) => {
				// @ts-ignore
				return b.experience - a.experience;
			})
			.slice(0, winnerRange),
	};

	log(
		finalRoundScores,
		finalRoundScores.rarity[0],
		gotchiBestSetTraitsRarityScore[19095],
	);
};

main();
