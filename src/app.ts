import { gql, GraphQLClient } from 'graphql-request';
import setInfo from './setList.js';

const subgraphUrl =
	'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic';

const client = new GraphQLClient(subgraphUrl);
const SUPPLY_CAP = 25_000;

export const seasonRoundBlockSnapshots = (season: number, round: number) =>
	[
		[14082019, 14645055, 15231396, 15748551],
		[20633778, 21170980, 21708942, 22242200],
		[25806267, 26308346, 26854118, 27404025],
		[0, 0, 0, 0],
	][season - 1][round - 1];

type Re = {
	id: number;
	kinship: number;
	equippedWearables: number[];
	experience: number;
	baseRarityScore: number;
	modifiedRarityScore: number;
	modifiedNumericTraits: number[];
	name: string;
	owner: {
		id: string;
	};
};

const allGotchiInfo = async (blockNumber?: number) => {
	let queryStr = '';
	for (let i = 0; i < SUPPLY_CAP / 1_000; i++) {
		queryStr += gql` data${i}:aavegotchis(${
			blockNumber ? `block: {number: ${blockNumber}}` : ''
		} first:1000 where: {
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
			name
			owner {
				id
			}
        } `;
	}

	const info = await client.request(
		gql`{ _meta${
			blockNumber ? `(block: {number: ${blockNumber}})` : ''
		} { block { number }} ${queryStr}}`,
	);
	const gotchis = Object.entries(info)
		.map(([key, val]) => {
			if (key.startsWith('data')) return val;
		})
		.filter((data) => data !== undefined)
		.flat() as Re[];

	return {
		block: info._meta.block,
		data: Object.fromEntries(gotchis.map((data) => [data.id, data])),
	};
};

const allSetsForItems = (items: number[]): number[] => {
	const matchingSets = setInfo
		.map(({ wearableIds }, index) => {
			let itemsMutable = items;
			const includesSet = wearableIds.every((num) => {
				if (itemsMutable.includes(num)) {
					// remove the matches to avoid double counting
					itemsMutable = itemsMutable.filter((item) => item != num);
					return true;
				}
				return false;
			});
			if (includesSet) return index;
			return 0;
		})
		.filter((data: number) => data != 0);
	return matchingSets;
};

const bestSetOfSets = (sets: number[]): number => {
	const rawBoosts = sets.map((setIndex) => {
		return setInfo[setIndex].traitsBonuses.reduce(
			(curr: number, next: number) => curr + Math.abs(next),
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

export const leaderboard = async (
	round: number,
	season?: number,
	blockNumber?: number,
	exportRange?: number,
) => {
	if (!exportRange) exportRange = SUPPLY_CAP;
	if (season) {
		// if requesting a season's round, if snapshot taken force that block number
		const newBlock = seasonRoundBlockSnapshots(season, round);
		if (newBlock) blockNumber = newBlock;
	}

	const rawResults = await allGotchiInfo(blockNumber);

	const gotchiData = rawResults.data;

	const gotchiToSets = Object.fromEntries(
		Object.entries(gotchiData).map(([key, val]) => {
			const sets = allSetsForItems(val.equippedWearables);
			return [key, sets];
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
		block: rawResults.block,
		rarity: Object.values(gotchiBestSetTraitsRarityScore)
			.sort((a, b) => tiebreaker(a, b, 'rarity'))
			.slice(0, exportRange),
		kinship: Object.values(gotchiBestSetTraitsRarityScore)
			.sort((a, b) => tiebreaker(a, b, 'kinship'))
			.slice(0, exportRange),
		experience: Object.values(gotchiBestSetTraitsRarityScore)
			.sort((a, b) => tiebreaker(a, b, 'experience'))
			.slice(0, exportRange),
	};

	return finalRoundScores;
};
