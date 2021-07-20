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
				arrivalDatetime = getters.getSecureArrivalDatetime(troopData.arrivalTime, troopData.attackCountdown, troopData.spottedDatetime);
		let troopArray = getters.getTroopTimes(distance),
			troopTimes :troopTimesEvaluated[] = [],
			i :number;


		/*
		var testTime = getters.calculateDistances(distance, 20, 3);
		console.log(
			"TESTTTTTTTTTT",
			troopData.senderCityCoordinates,
			troopData.targetCityCoordinates,
			testTime,
			secondsToTime(testTime),
			"STARTTIME",
			new Date(arrivalDatetime.getTime() - testTime*1000)
		);
		return;
		/**/

		// --------- FILTRO ------------
		//filtro via tutte le situazioni impossibili
		troopArray = troopArray.filter(({ time, arena, speed } :troopTimes) => {
			const travelTime = time*1000,
				gapTime = troopData.gapTime * 1000,
				spottedTimestamp = troopData.spottedDatetime.getTime(),
				previousTimestamp = spottedTimestamp - gapTime,
				arrivalTimestamp = arrivalDatetime.getTime(),
				//tempo in cui l'attacco è sicuramente partito basato sul tempo di arrivo e sul tempo di percorrenza
				startTimestamp = arrivalTimestamp - travelTime;

			//se la distanza è sotto i 20, conto solo le arene a 0 (che tanto le altre sarebbero tutte uguali)
			if(distance <= 20 && arena > 0)
				return false;

			// Per forza di cose non può arrivare dopo la data di arrivo
			if(previousTimestamp + travelTime > arrivalTimestamp)
				return false;
			// Prendo solo gli attacchi che sono partiti nel lasso di tempo tra le 2 volte che ho guardato la caserma
			return startTimestamp >= (spottedTimestamp - gapTime) && startTimestamp <= spottedTimestamp;
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
