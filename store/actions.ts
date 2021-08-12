import axios, { AxiosResponse } from 'axios';
import { debounce, cloneDeep } from 'lodash';
import { getUUID } from 'guebbit-javascript-library';
import { getDistance } from '@/assets/js/temporary';

import {
	troopTimes,
	troopTimesEvaluated,
	troopsElementMap,
	troopsRawMap,
	troopsFinalMap,
} from '@/interfaces';


export default{
	patchTroopDetails: async ({ commit, getters: { getTroopDetail } } :any, troopData :troopsFinalMap) :Promise<string> => {
		console.log("PATCH", troopData);
		// una vecchia copia nel caso qualcosa vada storto
		const oldTroopData = cloneDeep(getTroopDetail(troopData.id));
		//questo cambia reattivamente anche l'oggetto troopData (perché è solo una reference)
		commit("setTroopsFinal", troopData);

		console.log("XXX", process.env.apiUrl);return '';

		return axios.put(process.env.API_URL + '/metodo/product/' + troopData.id, troopData)
			.then((data :AxiosResponse<troopsFinalMap>) => {
				console.log("OKKKKKKKKKKKKKKK", data)
				//attackCountdown = 0; TODO rimuovere
				return 'id';
				//return data.id;
			})
			.catch((error :string) => {
				console.log("ERRORRRRRRRRRRRRRRR", error)
				//se qualcosa è andato storto, reverto
				commit("setTroopsFinal", oldTroopData);
				return oldTroopData.id;
			});
	},

	storeTroopDetails: async ({ commit } :any, troopData :troopsFinalMap) :Promise<string> => {
		console.log("STORE", troopData);
		return 'ID';
		//axios.post(process.env.API_URL + '/metodo/product', product)


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


	// getTroopsFromServer
	getTroopDetails: async ({ commit, dispatch } :any, attack_id :string) :Promise<troopsRawMap | false> => {
		console.log("GET", attack_id);
		return false;
		commit('setLoading', ['troops', true]);
		//axios.get(rootState.navigation.companyApiUrl + '/metodo/product/' + attack_id)
	},


	fetchTroopDetails: async ({ commit, dispatch, getters: { getTroopsFromServer } } :any) :Promise<troopsRawMap[]> => {
		console.log("GET ALL");
		return [];
		commit('setLoading', ['troops', true]);
		//axios.get(rootState.navigation.companyApiUrl + '/metodo/product',
		/*
		return axios.get(process.env.apiUrl+'api/travian-tools').then(({ data } :AxiosResponse ) => {
			for(let i :number = data.length; i--; )
				dispatch("translateTroopDetails", data[i]);
			return data;
		})
		*/
	},

	/**
	*
	*
	**/
	toggleTagAttack: async ({ getters: { getTroopDetail }, commit, dispatch } :any, [ attack_id, tag_id ] :[string, string]) :Promise<string> => {
		const troopData = getTroopDetail(attack_id),
			insertFlag = !troopData.activeTags.includes(tag_id);
		//questo cambia reattivamente anche l'oggetto troopData (perché è solo una reference)
		commit("toggleTagAttack", [attack_id, tag_id, insertFlag]);
		return dispatch("patchTroopDetails", {
			id: troopData.id,
			activeTags: troopData.activeTags
		}).catch(() => {
			//se qualcosa è andato storto, reverto
			commit("toggleTagAttack", [attack_id, tag_id, !insertFlag]);
		});
	},

	/**
	*
	*
	**/
	setAttackNote: debounce(async ({ commit, dispatch, getters: { getTroopDetail } } :any, [attack_id, text] :[string, string]) => {
		const { note :oldText } = getTroopDetail(attack_id);
		//cambio il testo per reattività	TODO da fare dentro setTroopDetail (per ogni cambiamento)
		commit("setAttackNote", [ attack_id, text ]);
		return axios.put(process.env.API_URL + '/metodo/product/' + attack_id, text)
			.catch(() => commit("setAttackNote", [ attack_id, oldText ]));
	}, 500),
	/**/









	calculateTroopsFinal: ({ state: { serverData: { mapSize } }, getters, commit } :any, troopData :troopsRawMap) :void => {
		// --------- CALCOLO DATI ------------
		const 	id = getUUID(),
				[ Xa, Ya ] = troopData.senderCityCoordinates,
				[ Xb, Yb ] = troopData.targetCityCoordinates,
				distance :number = getDistance(mapSize, parseInt(Xa), parseInt(Xb), parseInt(Ya), parseInt(Yb));
		let troopArray = getters.getTroopTimes(distance),
			troopTimes :troopTimesEvaluated[] = [],
			i :number;

		// --------- FILTRO ------------
		//filtro via tutte le situazioni impossibili
		troopArray = troopArray.filter(({ time, arena, artifact, boots } :troopTimes) => {
			const travelTime = time*1000,
				gapSeconds = troopData.gapSeconds * 1000,
				spottedTimestamp = new Date(troopData.spottedDate + " " + troopData.spottedTime).getTime(),
				arrivalTimestamp = new Date(troopData.arrivalDate + " " + troopData.arrivalTime).getTime(),
				previousTimestamp = spottedTimestamp - gapSeconds,
				//tempo in cui l'attacco è sicuramente partito basato sul tempo di arrivo e sul tempo di percorrenza
				startTimestamp = arrivalTimestamp - travelTime;
			//matching artifact & boots
			if(artifact !== troopData.artifact || boots !== troopData.boots)
				return false;
			//se la distanza è sotto i 20, conto solo le arene a 0 (che tanto le altre sarebbero tutte uguali)
			if(distance <= 20 && arena > 0)
				return false;
			// Per forza di cose non può arrivare dopo la data di arrivo
			if(previousTimestamp + travelTime > arrivalTimestamp)
				return false;
			// Prendo solo gli attacchi che sono partiti nel lasso di tempo tra le 2 volte che ho guardato la caserma
			return startTimestamp >= (spottedTimestamp - gapSeconds) && startTimestamp <= spottedTimestamp;
		});

		// --------- CALCOLI FINALI ------------
		//calcolo il fattore di rischio
		//calcolo in base alla plausibilità dell'attacco, alla presenza di cata, etc
		for(i = troopArray.length; i--; ){
			let risk :number = getters.riskCalculator(troopArray[i]);
			troopTimes.push({
				...troopArray[i],
				risk: risk,
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
		commit("setTroopTimes", [id, troopTimes])
		commit("setTroopsFinal", {
			...troopData,
			id,
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
