# aavegotchi-leaderboard

aavegotchi rarity farming leaderboard

<img src="https://repository-images.githubusercontent.com/521128304/f57b4194-3798-40e7-a54d-0e73ed1428cc"/>

# usage

```ts
import { leaderboard } from '@candoizo/aavegotchi-leaderboard';
```

there is also a cli:

```
npx @candoizo/aavegotchi-leaderboard --help
```

## Functions

<dl>
<dt><a href="#setData">setData(index)</a> ⇒</dt>
<dd><p>Get set information by index in the list of sets.</p>
</dd>
<dt><a href="#isSetItemsInEquippedWearables">isSetItemsInEquippedWearables(setItems, equippedWearables)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks whether the setItems is a subset of the equippedWearables</p>
</dd>
<dt><a href="#allSetsForItems">allSetsForItems(items)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>This function will return all of the sets that a player has equipped based on the items they have equipped</p>
</dd>
<dt><a href="#allSetsForAavegotchi">allSetsForAavegotchi(aavegotchi)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>This function will return all of the sets that an Aavegotchi has equipped based on the items they have equipped and collateral</p>
</dd>
<dt><a href="#bestSetOfSets">bestSetOfSets(sets)</a> ⇒ <code>number</code></dt>
<dd><p>Takes an array of set indices and returns the index of the set with the best bonuses</p>
</dd>
<dt><a href="#returnRarity">returnRarity(number)</a> ⇒ <code>number</code></dt>
<dd><p>This function returns the rarity bonus of a number given.</p>
</dd>
<dt><a href="#rarityScoreBonus">rarityScoreBonus(traits)</a> ⇒ <code>number</code></dt>
<dd><p>Takes an array of trait values and returns the total rarity score bonus.</p>
</dd>
<dt><a href="#kinshipMinusLastInteracted">kinshipMinusLastInteracted(kinship, lastInteracted)</a> ⇒ <code>number</code></dt>
<dd><p>Get the on-chain kinship using sui the current kinship and last interaction timestamp to calculate kinship, to get accurate value from subgraph Aavegotchis</p>
</dd>
<dt><a href="#seasonRoundBlockSnapshots">seasonRoundBlockSnapshots(season, round)</a> ⇒ <code>number</code> | <code>undefined</code></dt>
<dd><p>Get the block snapshots for the given season and round.</p>
</dd>
<dt><a href="#aavegotchis">aavegotchis([blockNumber])</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Fetch all Aavegotchi information from subgraph</p>
</dd>
<dt><a href="#leaderboard">leaderboard(round, [season], [blockNumber], [exportRange])</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Returns the leaderboard for a given round</p>
</dd>
</dl>

<a name="setData"></a>

## setData(index) ⇒

Get set information by index in the list of sets.

**Kind**: global function  
**Returns**: The current set data at the given index.

| Param | Type                | Description                                     |
| ----- | ------------------- | ----------------------------------------------- |
| index | <code>number</code> | The index of the set in the list, starting at 0 |

<a name="isSetItemsInEquippedWearables"></a>

## isSetItemsInEquippedWearables(setItems, equippedWearables) ⇒ <code>boolean</code>

Checks whether the setItems is a subset of the equippedWearables

**Kind**: global function  
**Returns**: <code>boolean</code> - True if the equippedWearables match the setItems

| Param             | Type                              | Description                                                  |
| ----------------- | --------------------------------- | ------------------------------------------------------------ |
| setItems          | <code>Array.&lt;number&gt;</code> | Set to check the first array is a subset of the second array |
| equippedWearables | <code>Array.&lt;number&gt;</code> | Set to check the first array is a subset of the second array |

<a name="allSetsForItems"></a>

## allSetsForItems(items) ⇒ <code>Array.&lt;number&gt;</code>

This function will return all of the sets that a player has equipped based on the items they have equipped

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - An array of all the set by index that the player has equipped

| Param | Type                              | Description                                               |
| ----- | --------------------------------- | --------------------------------------------------------- |
| items | <code>Array.&lt;number&gt;</code> | An array of all the item ids that the player has equipped |

<a name="allSetsForAavegotchi"></a>

## allSetsForAavegotchi(aavegotchi) ⇒ <code>Array.&lt;number&gt;</code>

This function will return all of the sets that an Aavegotchi has equipped based on the items they have equipped and collateral

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - An array of all the set by index that the player has equipped

| Param      | Type                        | Description                                                                                        |
| ---------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| aavegotchi | <code>SubgraphResult</code> | Object representing an Aavegotchi subgraph result with equippedWearables and collateral properties |

<a name="bestSetOfSets"></a>

## bestSetOfSets(sets) ⇒ <code>number</code>

Takes an array of set indices and returns the index of the set with the best bonuses

**Kind**: global function  
**Returns**: <code>number</code> - The index of the set with the best bonuses

| Param | Type                              | Description             |
| ----- | --------------------------------- | ----------------------- |
| sets  | <code>Array.&lt;number&gt;</code> | An array of set indices |

<a name="returnRarity"></a>

## returnRarity(number) ⇒ <code>number</code>

This function returns the rarity bonus of a number given.

**Kind**: global function  
**Returns**: <code>number</code> - The rarity of the given number.

| Param  | Type                | Description                 |
| ------ | ------------------- | --------------------------- |
| number | <code>number</code> | A number between 1 and 100. |

<a name="rarityScoreBonus"></a>

## rarityScoreBonus(traits) ⇒ <code>number</code>

Takes an array of trait values and returns the total rarity score bonus.

**Kind**: global function  
**Returns**: <code>number</code> - The total rarity score bonus.

| Param  | Type                              | Description               |
| ------ | --------------------------------- | ------------------------- |
| traits | <code>Array.&lt;number&gt;</code> | An array of trait values. |

<a name="kinshipMinusLastInteracted"></a>

## kinshipMinusLastInteracted(kinship, lastInteracted) ⇒ <code>number</code>

Get the on-chain kinship using sui the current kinship and last interaction timestamp to calculate kinship, to get accurate value from subgraph Aavegotchis

**Kind**: global function  
**Returns**: <code>number</code> - A kinship score.
https://github.com/aavegotchi/aavegotchi-contracts/blob/847e437bf31a746b520c1b506adef7788716e797/contracts/Aavegotchi/libraries/LibAavegotchi.sol#L223

| Param          | Type                | Description                          |
| -------------- | ------------------- | ------------------------------------ |
| kinship        | <code>number</code> | A kinship value.                     |
| lastInteracted | <code>number</code> | A timestamp of the last interaction. |

<a name="seasonRoundBlockSnapshots"></a>

## seasonRoundBlockSnapshots(season, round) ⇒ <code>number</code> \| <code>undefined</code>

Get the block snapshots for the given season and round.

**Kind**: global function  
**Returns**: <code>number</code> \| <code>undefined</code> - A canonical snapshot block number for the given season and round. 0/undefined if not set.

| Param  | Type                | Description       |
| ------ | ------------------- | ----------------- |
| season | <code>number</code> | The season number |
| round  | <code>number</code> | The round number  |

<a name="aavegotchis"></a>

## aavegotchis([blockNumber]) ⇒ <code>Promise.&lt;Object&gt;</code>

Fetch all Aavegotchi information from subgraph

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Returns data in a promise

| Param         | Type                | Description                      |
| ------------- | ------------------- | -------------------------------- |
| [blockNumber] | <code>number</code> | The number of the block to query |

<a name="leaderboard"></a>

## leaderboard(round, [season], [blockNumber], [exportRange]) ⇒ <code>Promise.&lt;Object&gt;</code>

Returns the leaderboard for a given round

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - An object containing the leaderboard results

| Param         | Type                | Description                                          |
| ------------- | ------------------- | ---------------------------------------------------- |
| round         | <code>number</code> | The round for which to return the leaderboard        |
| [season]      | <code>number</code> | The season for which to return the leaderboard       |
| [blockNumber] | <code>number</code> | The block number for which to return the leaderboard |
| [exportRange] | <code>number</code> | The amount of results to return                      |
