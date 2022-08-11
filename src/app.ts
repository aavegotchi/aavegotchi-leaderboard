import { gql, GraphQLClient } from 'graphql-request';
import wearableSets from './setList.js';

type LeaderboardCategories = 'rarity' | 'kinship' | 'experience';

type SubgraphResult = {
	id: string;
	kinship: string;
	equippedWearables: number[];
	experience: string;
	baseRarityScore: string;
	modifiedRarityScore: string;
	modifiedNumericTraits: number[];
	name: string;
	lastInteracted: number;
	collateral: string;
	owner: {
		id: string;
	};
};

type LeaderboardResult = {
	data: SubgraphResult;
	rarity: number;
	kinship: number;
	experience: number;
	setTraits: number[];
	bestSetInfo: unknown | undefined;
};

const subgraphUrl =
	'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic';

const client = new GraphQLClient(subgraphUrl);
const SUPPLY_CAP = 25_000;

/**
 * @description Get set information by index in the list of sets.
 * @param {number} index - The index of the set in the list, starting at 0
 * @returns The current set data at the given index.
 */
export const setData = (index: number) => {
	return wearableSets[index];
};

/**
 * @description Checks whether the setItems is a subset of the equippedWearables
 * @param {number[]} setItems - Set to check the first array is a subset of the second array
 * @param {number[]} equippedWearables - Set to check the first array is a subset of the second array
 * @returns {boolean} True if the equippedWearables match the setItems
 */
export const isSetItemsInEquippedWearables = (
	setItems: number[],
	equippedWearables: number[],
) => {
	// subset([1, 2, 3], [1, 2, 3, 4, 5]) // true
	// subset([1, 2, 3, 4], [1, 2, 3]) // false
	// subset([1, 1, 2, 2], [1, 2, 1, 2, 3]) // true

	const countUnique = (arr: number[]) =>
		arr.reduce(
			(acc: Record<number, number>, curr: number) => ({
				...acc,
				[curr]: (acc[curr] || 0) + 1,
			}),
			{},
		);

	// Set to check the first array is a subset of the second array
	const set1 = countUnique(setItems);
	// Set to check the first array is a subset of the second array
	const set2 = countUnique(equippedWearables);

	for (const val of Object.keys(set1).map(Number)) {
		// If a value doesn't exist in the second set or the key count is less
		if (!set2[val] || set1[val] > set2[val]) {
			return false;
		}
	}
	return true;
};

/**
 * @description This function will return all of the sets that a player has equipped based on the items they have equipped
 * @param {number[]} items - An array of all the item ids that the player has equipped
 * @returns {number[]} An array of all the set by index that the player has equipped
 */
export const allSetsForItems = (items: number[]): number[] => {
	const matchingSets = wearableSets
		.map(({ wearableIds }, index) => {
			if (isSetItemsInEquippedWearables(wearableIds, items)) return index;
			return 0;
		})
		.filter((data: number) => data != 0);
	return matchingSets;
};

/**
 * @description This function will return all of the sets that an Aavegotchi has equipped based on the items they have equipped and collateral
 * @param {SubgraphResult} aavegotchi - Object representing an Aavegotchi subgraph result with equippedWearables and collateral properties
 * @returns {number[]} An array of all the set by index that the player has equipped
 */
export const allSetsForAavegotchi = (aavegotchi: SubgraphResult): number[] => {
	const matchingSets = allSetsForItems(aavegotchi.equippedWearables);

	const setsMatchingAllowedCollateral = matchingSets.filter((setIndex) => {
		const set = setData(setIndex);
		if (set && set?.allowedCollaterals.length > 0) {
			const collaterals = [
				'',
				'0x20D3922b4a1A8560E1aC99FBA4faDe0c849e2142', // maweth
				'0x823CD4264C1b951C9209aD0DeAea9988fE8429bF', // maave
				'0x98ea609569bD25119707451eF982b90E3eb719cD', // malink
				// @todo need collateralList if more are added
			];
			const setCollateralAddresses = set.allowedCollaterals.map(
				(collateralNumber) => collaterals[collateralNumber].toLowerCase(),
			);
			const setMatchesCollateral = setCollateralAddresses.includes(
				aavegotchi.collateral.toLowerCase(),
			);
			return setMatchesCollateral;
		}
		return true;
	});
	return setsMatchingAllowedCollateral;
};

/**
 * @description Takes an array of set indices and returns the index of the set with the best bonuses
 * @param {number[]} sets - An array of set indices
 * @returns {number} The index of the set with the best bonuses
 */
export const bestSetOfSets = (sets: number[]): number => {
	const rawBoosts = sets.map((setIndex) => {
		return wearableSets[setIndex].traitsBonuses.reduce(
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

/**
 * @description This function returns the rarity bonus of a number given.
 * @param {number} number - A number between 1 and 100.
 * @returns {number} The rarity of the given number.
 */
export const returnRarity = (number: number) => {
	if (number < 50) return 100 - number;
	else return number + 1;
};

/**
 * @description Takes an array of trait values and returns the total rarity score bonus.
 * @param {number[]} traits - An array of trait values.
 * @returns {number} The total rarity score bonus.
 */
export const rarityScoreBonus = (traits: number[]): number => {
	return traits.reduce((curr, next) => curr + returnRarity(next), 0);
};

/**
 * @description Get the on-chain kinship using sui the current kinship and last interaction timestamp to calculate kinship, to get accurate value from subgraph Aavegotchis
 * @param {number} kinship - A kinship value.
 * @param {number} lastInteracted - A timestamp of the last interaction.
 * @returns {number} A kinship score.
 * https://github.com/aavegotchi/aavegotchi-contracts/blob/847e437bf31a746b520c1b506adef7788716e797/contracts/Aavegotchi/libraries/LibAavegotchi.sol#L223
 */
export const kinshipMinusLastInteracted = (
	kinship: number,
	lastInteracted: number,
): number => {
	const dayInSeconds = 60 * 60 * 24;
	const now = Date.now();
	const sinceLastInteraction = now - lastInteracted;
	const daysSinceLastInteraction = dayInSeconds / sinceLastInteraction;
	return kinship - Math.round(daysSinceLastInteraction);
};

/**
 * @description Get the block snapshots for the given season and round.
 * @param {number} season - The season number
 * @param {number} round - The round number
 * @returns {number|undefined} A canonical snapshot block number for the given season and round. 0/undefined if not set.
 */
export const seasonRoundBlockSnapshots = (
	season: number,
	round: number,
): number =>
	[
		[14082019, 14645055, 15231396, 15748551],
		[20633778, 21170980, 21708942, 22242200],
		[25806267, 26308346, 26854118, 27404025],
		[],
	][season - 1][round - 1];

/**
 * @description Fetch all Aavegotchi information from subgraph
 * @async
 * @param {number} [blockNumber] - The number of the block to query
 * @returns {Promise<Object>} Returns data in a promise
 */
export const aavegotchis = async (blockNumber?: number) => {
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
			lastInteracted
			collateral
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
		.flat() as SubgraphResult[];

	return {
		block: info._meta.block,
		data: Object.fromEntries(gotchis.map((data) => [data.id, data])),
	};
};

/**
 * @description Returns the leaderboard for a given round
 * @async
 * @param {number} round - The round for which to return the leaderboard
 * @param {number} [season] - The season for which to return the leaderboard
 * @param {number} [blockNumber] - The block number for which to return the leaderboard
 * @param {number} [exportRange] - The amount of results to return
 * @returns {Promise<Object>} An object containing the leaderboard results
 */
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

	const rawResults = await aavegotchis(blockNumber);

	const gotchiData = rawResults.data;

	const gotchiToSets = Object.fromEntries(
		Object.entries(gotchiData).map(([key, val]) => {
			const sets = allSetsForAavegotchi(val);
			return [key, sets];
		}),
	);

	const gotchiBestSetTraitsRarityScore: { [key: string]: LeaderboardResult } =
		Object.fromEntries(
			Object.entries(gotchiToSets).map(([key, sets]) => {
				const currentGotchiInfo = gotchiData[key];
				if (sets.length == 0)
					return [
						key,
						{
							data: currentGotchiInfo,
							rarity: Number(gotchiData[key].modifiedRarityScore),
							kinship: Number(gotchiData[key].kinship),
							experience: Number(gotchiData[key].experience),
							setTraits: gotchiData[key].modifiedNumericTraits,
							bestSetInfo: undefined,
						},
					];

				const best = bestSetOfSets(sets);
				const bestSetInfo = wearableSets[best];
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
						data: currentGotchiInfo,
						rarity: finalRarity,
						kinship: Number(gotchiData[key].kinship),
						experience: Number(gotchiData[key].experience),
						setTraits: gotchiSetFinalTraits,
						bestSetInfo,
					},
				];
			}),
		);

	const tiebreaker = (
		a: LeaderboardResult,
		b: LeaderboardResult,
		type: LeaderboardCategories,
	) => {
		// no tiebreaker
		if (a[type] != b[type]) return b[type] - a[type];

		// trait tiebreaker
		const tiebreakerIndex = round - 1;

		const distanceFrom50 = (num: number): number => Math.abs(num - 50);

		return (
			distanceFrom50(b.setTraits[tiebreakerIndex]) -
			distanceFrom50(a.setTraits[tiebreakerIndex])
		);
	};

	const bestGotchisArray = Object.values(gotchiBestSetTraitsRarityScore);
	const finalExportRange =
		exportRange > bestGotchisArray.length ? bestGotchisArray.length : exportRange;

	const finalRoundScores = {
		block: rawResults.block,
		rarity: bestGotchisArray
			.sort((a, b) => tiebreaker(a, b, 'rarity'))
			.slice(0, finalExportRange),
		kinship: bestGotchisArray
			.sort((a, b) => tiebreaker(a, b, 'kinship'))
			.slice(0, finalExportRange),
		experience: bestGotchisArray
			.sort((a, b) => tiebreaker(a, b, 'experience'))
			.slice(0, finalExportRange),
	};

	return finalRoundScores;
};
