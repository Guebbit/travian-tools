export enum troopDetailCategoryEnum {
	inAttack = 'inAttack',
	inRaid = 'inRaid',
	inSupply = 'inSupply',
	inReturn = 'inReturn',
    outAttack = 'outAttack',
	outRaid = 'outRaid',
    outSupply = 'outSupply',
}

export interface troopsElementMap {
    category: troopDetailCategoryEnum
    senderName :string
    senderCityLabel :string
    senderCityCoordinates :[string, string] //TODO number, number (parseInt da NaN?)
    attackCountdown? :string	//serve solo per aiutare a ricavare arrivalDate
	arrivalTime :string
}

export interface basicDataElementMap {
	targetName :string
	targetCityLabel :string
	targetCityCoordinates :[string, string] //TODO number, number (parseInt da NaN?)
	spottedDate :string
	spottedTime :string
}

//TODO attackCountdown da rimuovere ma poi problemi a calcolare l'esatto arrivalDatetime?
export type troopsRawMap = basicDataElementMap & troopsElementMap & {
	id :string
	arrivalDate :string
	gapSeconds :number	//TODO TEMP trovare un nome migliore per i minuti AFK
	artifact :number,
	boots :number,
	note :string
	activeTags :string[],
}

export interface troopsFinalMap extends troopsRawMap {
    distance :number
}






export interface troopTimes {
	speed :number,
	arena :number,
	time :number,
	artifact :number,
	boots :number,
}
export interface troopTimesEvaluated extends troopTimes {
	// rischi da 1 a 5
	risk :number
}
