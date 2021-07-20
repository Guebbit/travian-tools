export interface troopTimes {
	speed :number,
	arena :number,
	time :number,		//seconds number
}
export interface troopTimesEvaluated extends troopTimes {
	// rischi da 1 a 5
	risk :number
	userRisk :number
}

export interface MediaChunk {
    chunkType :string
    url :string
    thumb100 :string
    thumb800 :string
}






export enum troopDetailCategoryEnum {
    outRaid = 'outRaid',
    outAttack = 'outAttack',
    outSupply = 'outSupply',
    inRaid = 'inRaid',
    inAttack = 'inAttack',
    inSupply = 'inSupply'
}

export interface troopsElementMap {
    category: troopDetailCategoryEnum
    senderName :string
    senderCityLabel :string
    senderCityCoordinates :[string, string] //TODO number, number (parseInt da NaN?)
    attackCountdown: string
	arrivalTime: string
}

export interface basicDataElementMap {
	targetName :string
	targetCityLabel :string
	targetCityCoordinates :[string, string] //TODO number, number (parseInt da NaN?)
	spottedDatetime :Date	//da usare per trovare lo startDatetime
}

export type troopsRawMap = basicDataElementMap & troopsElementMap & {
	id :string
	gapTime :number	//TODO TEMP trovare un nome migliore per i minuti AFK
}

export interface troopsFinalMap extends troopsRawMap {
    distance :number
	arrivalDatetime :Date
	troopTimes :troopTimesEvaluated[]
}

export interface troopCharacteristicsMap {
    speed :number,
    name :string,
    image? :MediaChunk
};

export interface stateMap {
    debug: boolean
    loading: Record<string,boolean>
    troopDetails :Record<string,troopsFinalMap>
    serverData: {
		serverName :string
        mapSize :number
		speed :number
		arenaCap :number
    },
    gameData: {
        troopsData :troopCharacteristicsMap[]
    },
}
