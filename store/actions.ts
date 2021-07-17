import axios, { AxiosResponse } from 'axios';
import { getUUID } from 'guebbit-javascript-library';
import { getDistance, secondsToTime } from '@/assets/js/temporary';

import {
	troopTimes,
	troopTimesEvaluated,
	troopsElementMap,
	troopsRawMap,
	troopsFinalMap,
} from '@/interfaces';

//TODO nuxt $t in store?
const $t = (text :string) => {
	return text;
};


export default{

	addTroops: async ({ dispatch } :any, troopData: troopsElementMap ) :Promise<troopsRawMap[]> => {
		return [];
		/*
		//TODO inserisco con ID fittizio, inserisco tale ID fittizio in un buffer, dopo di ché elimino(?) e RI-salvo i dati ma con il vero id? (per reattività)
		return axios.post(process.env.apiUrl+'api/travian-tools', troopData)
			.then(({ data, status } :AxiosResponse) :any => {
				console.log("addTroops OK", data, status);
				return data;
			})
			.catch((response) :any => dispatch("standardServerErrorManagement", response));
		*/
	},

	getTroopsFromServer: async ({ dispatch } :any) :Promise<troopsRawMap[]> => {
		return [];
		/*
		return axios.get(process.env.apiUrl+'api/travian-tools').then(({ data } :AxiosResponse ) => {
			for(let i :number = data.length; i--; )
				dispatch("translateTroopDetails", data[i]);
			return data;
		})
		*/
	},




	calculateTroopsFinal: ({ state: { serverData: { mapSize } }, getters, commit } :any, troopData :troopsRawMap | troopsFinalMap) :void => {
		console.log("STARTTTTTTTTTTTTTTTTTTTT", troopData);

		// --------- CALCOLO DATI ------------
		const 	[ Xa, Ya ] = troopData.senderCityCoordinates,
				[ Xb, Yb ] = troopData.targetCityCoordinates,
				distance :number = getDistance(mapSize, parseInt(Xa), parseInt(Xb), parseInt(Ya), parseInt(Yb)),
				//siccome c'è sempre un lagg di qualche secondo, lo uso solo per ricavare il giorno e sostituisco l'ora con quella "esatta"
				arrivalDatetime = getters.getSecureArrivalDatetime(troopData.arrivalTime, troopData.attackCountdown, troopData.startDatetime);
		let troopArray = getters.getTroopTimes(distance),
			troopTimes :troopTimesEvaluated[] = [],
			i :number;
		/*
		console.log(
			"TESTTTTTTTTTT",
			getters.calculateDistances(distance, 9, 3),
			secondsToTime(getters.calculateDistances(distance, 9, 3)),
		);
		*/

		// --------- FILTRO ------------
		//filtro via tutte le situazioni impossibili
		troopArray = troopArray.filter(({ time } :troopTimes) => {
			const travelTime = time*1000,
				missingTime = troopData.missingTime * 1000,
				startTimestamp = troopData.startDatetime.getTime(),
				arrivalTimestamp = arrivalDatetime.getTime();
			//Per forza di cose non può arrivare dopo la data di arrivo
			if(startTimestamp + travelTime > arrivalTimestamp)
				return false;
			//E non poteva partito quando ho osservato l'ultima volta e non c'era (qua dipende da quanto dichiara l'utente con missingTime)
			if(
				//l'attacco deve stare tra la data di inizio spottata (+ eventuale missing time)
				startTimestamp - missingTime < travelTime &&
				// e quella di arrivo
				arrivalTimestamp < travelTime
			)
				return false;
			// ora rimangono tutti gli attacchi che starebbero dentro questo lasso di tempo,
			// ma devo ottenere solo quelli che sono partiti tra (startTimestamp - missingTime) e startTimestamp
			// TODO semplificare?
			/*
			if(
				// quando ho spottato l'attacco + il tempo AFK
				startTimestamp - missingTime < arrivalTimestamp &&
				// quando ho effettivamente spottato l'attacco
				arrivalTimestamp < startTimestamp
			)
				return false;
			*/
			//console.log("ASD", missingTime, (arrivalTimestamp - startTimestamp - travelTime));
			console.log("ASD", new Date(arrivalTimestamp - travelTime));

			if((arrivalTimestamp - travelTime) > (startTimestamp - missingTime) && (arrivalTimestamp - travelTime) < startTimestamp)
				return false;

			//if(travelTime > (startTimestamp - missingTime) && travelTime < startTimestamp)
			//	return false;
			console.log("DOPO", new Date(startTimestamp - missingTime));
			console.log("PRIMA", troopData.startDatetime);
			//TODO ordinare per timeDistance? Magari dentro troopTimesFiltered in attackDetailCard.vue
			//console.log("timeDistance", (arrivalTimestamp - startTimestamp) - travelTime)
			return true;
		});

		// --------- CALCOLI FINALI ------------
		//calcolo il fattore di rischio
		//calcolo in base alla plausibilità dell'attacco, alla presenza di cata, etc
		for(i = troopArray.length; i--; ){
			let risk :number = getters.riskCalculator(troopArray[i]);
			troopTimes.push({
				...troopArray[i],
				risk: risk,
				userRisk: risk,
			})
		}

		// --------- CHECK DATI ------------
		// nel caso ci siano dati invalidi
		if(
			!troopData.senderCityCoordinates ||
			(troopData.senderCityCoordinates[0] === '0' && troopData.senderCityCoordinates[1] === '0') ||
			troopData.senderCityLabel === '' ||
			troopData.arrivalTime === '' ||
			troopData.attackCountdown === ''
		)
			return;

		// --------- CONFERMO I DATI ------------
		commit("setTroopsFinal", {
			...troopData,
			//TODO temporary loading ids
			id: getUUID(),
			arrivalDatetime,
			troopTimes,
		} as troopsFinalMap);
	},

	standardServerErrorManagement({ response, request } :any) :any {
		console.log("ERROR", response, request);
		if(response)
			return {
				status: response.status,
				data: Object.values(response.data.errors),
			};
		// client never received a response, or request never left
		if(request)
			return {
				status: 500,
				data: ['unknown'],
			};
		// anything else
		return {
			status: 500,
			data: ['unknown'],
		};
	},

	translateTroopDetails() :troopsFinalMap[] {
		return [];
	},

	/**
	*	calcolo le possibili arene in base al tipo di truppa e al tempo di screen
	**/
	arenaCalc({ getters: { arena } } :any) :number {
		return 100;
	}
};
