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
<dt><a href="#isSetItemsInEquippedWearables">isSetItemsInEquippedWearables(setItems, equippedWearables)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks whether the setItems is a subset of the equippedWearables</p>
</dd>
<dt><a href="#allSetsForItems">allSetsForItems(items)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>This function will return all of the sets that a player has equipped based on the items they have equipped</p>
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
<dt><a href="#seasonRoundBlockSnapshots">seasonRoundBlockSnapshots(season, round)</a> ⇒ <code>number</code> | <code>undefined</code></dt>
<dd><p>Get the block snapshots for the given season and round.</p>
</dd>
<dt><a href="#aavegotchis">aavegotchis([blockNumber])</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Async function to fetch all Aavegotchi information from subgraph</p>
</dd>
<dt><a href="#leaderboard">leaderboard(round, [season], [blockNumber], [exportRange])</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Returns the leaderboard for a given round and optionally a past season</p>
</dd>
</dl>

<a name="isSetItemsInEquippedWearables"></a>

## isSetItemsInEquippedWearables(setItems, equippedWearables) ⇒ <code>boolean</code>

Checks whether the setItems is a subset of the equippedWearables

**Kind**: global function  
**Returns**: <code>boolean</code> - - True if the equippedWearables match the setItems

| Param             | Type                              | Description                                                  |
| ----------------- | --------------------------------- | ------------------------------------------------------------ |
| setItems          | <code>Array.&lt;number&gt;</code> | Set to check the first array is a subset of the second array |
| equippedWearables | <code>Array.&lt;number&gt;</code> | Set to check the first array is a subset of the second array |

<a name="allSetsForItems"></a>

## allSetsForItems(items) ⇒ <code>Array.&lt;number&gt;</code>

This function will return all of the sets that a player has equipped based on the items they have equipped

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - - An array of all the set ids that the player has equipped

| Param | Type                              | Description                                               |
| ----- | --------------------------------- | --------------------------------------------------------- |
| items | <code>Array.&lt;number&gt;</code> | An array of all the item ids that the player has equipped |

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

Async function to fetch all Aavegotchi information from subgraph

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - - Returns data in a promise

| Param         | Type                | Description                      |
| ------------- | ------------------- | -------------------------------- |
| [blockNumber] | <code>number</code> | The number of the block to query |

<a name="leaderboard"></a>

## leaderboard(round, [season], [blockNumber], [exportRange]) ⇒ <code>Promise.&lt;Object&gt;</code>

Returns the leaderboard for a given round and optionally a past season

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - - An object containing the leaderboard results

| Param         | Type                | Description                                          |
| ------------- | ------------------- | ---------------------------------------------------- |
| round         | <code>number</code> | The round for which to return the leaderboard        |
| [season]      | <code>number</code> | The season for which to return the leaderboard       |
| [blockNumber] | <code>number</code> | The block number for which to return the leaderboard |
| [exportRange] | <code>number</code> | The amount of results to return                      |
