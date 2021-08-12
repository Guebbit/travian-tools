export {
	troopDetailCategoryEnum,
	troopsElementMap,
	basicDataElementMap,
	troopsRawMap,
	troopsFinalMap,
	troopTimes,
	troopTimesEvaluated,
} from './troopDetails';

import {
	troopsFinalMap,
	troopTimesEvaluated,
} from './troopDetails';

export interface MediaChunk {
    chunkType :string
    url :string
    thumb100 :string
    thumb800 :string
}

export interface troopCharacteristicsMap {
    speed :number,
    name :string,
    image? :MediaChunk
}

export interface tagMap {
	id :string,
	labelKey :string,
	icon :string,
	color :string,
}




//Vengono settati alla "creazione" dell'admin?
export interface serverDataMap {
	serverName :string
	mapSize :number
	speed :number
	arenaCap :number
	language :string
}

export interface gameDataMap {
	troopsData :troopCharacteristicsMap[]
	bonusBoots :number[]
	bonusArtifact :number[]
}

export interface appDataMap {
	attackTags :Record<string,tagMap>
}

export interface stateMap {
    debug: boolean
    loading: Record<string,boolean>
    troopDetails :Record<string,troopsFinalMap>
	troopTimes :Record<string,troopTimesEvaluated[]>
    serverData :serverDataMap,
    gameData :gameDataMap,
	appData :appDataMap,
}
