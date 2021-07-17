import {
	stateMap,
	troopsElementMap,
	troopsFinalMap,
	troopTimes,
	troopDetailCategoryEnum,
} from '@/interfaces';

import {
	secondsToTime,
	timeToSeconds,
} from '@/assets/js/temporary';

//TODO nuxt $t in store?
const $t = (text :string) => {
	return text;
};

export default {
	normalAttacks: ({ troopDetails }: stateMap) :troopsFinalMap[] => {
		return Object.values(troopDetails).filter(({ category }) => {
			return category === 'inAttack';
		});
	},

	// TODO items && Artifacts:
	// http://travian.kirilloid.ru/distance.php
	// http://travian.kirilloid.ru/js/distance.js?a
	getTroopTimes: ({ gameData: { troopsData = [] } } :stateMap, { calculateDistances } :any) => (distance :number) :troopTimes[] => {
		let i :number,
			arena :number,
			distanceArray :troopTimes[] = [];
		//truppe
		for(i = troopsData.length; i--; )
			//livelli arena
			for(arena = 0; arena < 20; arena++)
				distanceArray.push({
					speed: troopsData[i].speed,
					time: calculateDistances(distance, arena, troopsData[i].speed),
					arena,
				});

		return distanceArray;
	},

	/**
	*	TODO
	*	@return number of seconds
	**/
	//bonus = 25% stivali + 25% artefatti, etc
	calculateDistances: ({ serverData: { speed :serverSpeed } } :any) => (distance :number, arena :number, speed :number, bonus :number = 0) :number => {
		const distancePre :number = Math.min(20, distance),
			distancePost :number = Math.max(0, distance - distancePre),
			speedPost = (speed*(100+arena*20+bonus)/100);
		return Math.round((distancePre / speed + distancePost / speedPost) * 3600) * serverSpeed;
	},

	/**
	*	Tramite il countdown e la data attuale (startDatetime altrimenti è il momento in cui inserisco l'info)
	*	ottengo la data di arrivo ma non molto precisa nei secondi, quindi sostituisco con la data precisa.
	*	WARNING potrebbero verificarsi casi limite a mezzanotte precisa e 0 millisecondi? Boh
	*
	**/
	getSecureArrivalDatetime: ({} :stateMap) => (arrivalTime :string, attackCountdown :string, startDatetime :Date = new Date()) :Date => {
		const unstableDate = new Date(startDatetime.getTime() + timeToSeconds(attackCountdown)*1000);
		return new Date(
			(unstableDate.getMonth()+1) + "/" +
			unstableDate.getDate() + "/" +
			unstableDate.getFullYear() + " " +
			arrivalTime
		);
	},

	/**
	*	il timestamp dentro il value non si aggiorna ma la data nel textContent sì,
	*	quindi per avere una data precisa uso entrambi
	*
	*	TODO caso limite del giorno dopo da gestire
	**/
	getSecureSpottedDatetime: ({} :stateMap) => (element :HTMLSpanElement) :Date => {
		//se non ho il necessario, do la data di quando è stato copiaincollata la caserma meno 5 minuti
		if(!element || !element.hasAttribute('value'))
			return new Date(Date.now() - 300000);
		const unstableDate = new Date(parseInt(element.getAttribute('value')!)*1000),
			stableTime = element.textContent || '';
		//se non ho lo stableTime, mi accountento dell'unstable
		if(!stableTime)
			return unstableDate;
		// se è stato fatto di notte potrebbe essere passato 1 giorno
		// TODO
		// se ho un startDatetime trovato sul server, altrimenti metto la data attuale (che dovrebbe poco successiva)
		return new Date(
			(unstableDate.getMonth()+1) + "/" +
			unstableDate.getDate() + "/" +
			unstableDate.getFullYear() + " " +
			stableTime
		);
	},

	getTroopsFromLocal: (state: stateMap) => (element :HTMLTableElement ) :troopsElementMap | false => {
		// no classi = errore
		if(!element.classList || element.classList.length < 2 || !element.classList[1])
			return false;

		// --------- DEFAULT ------------
		let category = element.classList[1] as troopDetailCategoryEnum,
			senderCityLabel = '',
			senderName = '',
			senderCityCoordinates :[string, string] = ['0','0'],
			attackCountdown :string = '',
			arrivalTime :string = '';

		// --------- ESTRAZIONE DATI ------------
		// villo bersaglio
		if(element.querySelector('.role'))
			senderCityLabel = (element.querySelector('.role')!.textContent || '').replace(/\t/g, '');
		// coordinate villo bersaglio
		if(element.querySelector('.coordinateX') && element.querySelector('.coordinateY')){
			senderCityCoordinates[0] = (element.querySelector('.coordinateX')!.textContent || '').replace('−‭', '-').replace(/[^0-9\-]/g, '');
			senderCityCoordinates[1] = (element.querySelector('.coordinateY')!.textContent || '').replace('−‭', '-').replace(/[^0-9\-]/g, '');
		}
		// nome player attaccante
		if(element.querySelector('.troopHeadline > a:nth-child(2)')){
			senderName = (element.querySelector('.troopHeadline > a:nth-child(2)')!.textContent || '');
			senderName = senderName.split($t(' attacca '))[0];
		}
		// data di arrivo (nel caso non sia disponibile)
		if(element.querySelector('.at > span:nth-child(1)') && element.querySelector('.timer')){
			arrivalTime = (element.querySelector('.at > span:nth-child(1)')!.textContent || '').slice(-8);
			attackCountdown = element.querySelector('.timer')!.textContent || '';
		}
		// --------- INVIO DATI ------------
		return {
			category,
			senderName,
			senderCityLabel,
			senderCityCoordinates,
			arrivalTime,
			attackCountdown,
		};
	},

	riskCalculator: ({} :any) => ({ speed } :troopTimes) :number => {
		if(speed === 3)
			return 5;
		if(speed === 4 || speed === 5)
			return 4;
		return 0;
	},

};
