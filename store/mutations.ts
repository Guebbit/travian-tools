import Vue from 'vue';
import {
	stateMap,
	troopsRawMap,
	troopsFinalMap,
} from '@/interfaces';



export default {
	setLoading: ({ loading } :stateMap, [type, isLoading] :[ string, boolean ]) :void => {
		Vue.set(loading, type, isLoading);
	},

	setTroopsFinal: ({ troopDetails } :stateMap, troopData :troopsFinalMap) :void => {
		Vue.set(
			troopDetails,
			troopData.id,
			troopData
		);
	},
};
