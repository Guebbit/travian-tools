import Vue from 'vue';
import {
	stateMap,
	troopsFinalMap,
	troopTimesEvaluated,
} from '@/interfaces';



export default {
	setLoading: ({ loading } :stateMap, [ type, isLoading ] :[ string, boolean ]) :void => {
		Vue.set(loading, type, isLoading);
	},

	setTroopsFinal: ({ troopDetails } :stateMap, troopData :troopsFinalMap) :void => {
		Vue.set(
			troopDetails,
			troopData.id,
			troopData
		);
	},

	setTroopTimes: ({ troopTimes } :stateMap, [id, troopTimesArray] :[string, troopTimesEvaluated[]]) :void => {
		Vue.set(
			troopTimes,
			id,
			troopTimesArray
		);
	},

	setAttackNote: ({ troopDetails } :stateMap, [ attack_id, text ] :[ string, string ]) :void => {
		if(!troopDetails.hasOwnProperty(attack_id))
			return;
		Vue.set(troopDetails[attack_id], 'note', text);
	},

	/**
	*	@param insertFlag boolean = true = metti, false = togli, null = toggle
	**/
	toggleTagAttack: ({ troopDetails } :stateMap, [ attack_id, tag_id, insertFlag = null ] :[ string, string, boolean | null ]) :void => {
		if(!troopDetails.hasOwnProperty(attack_id))
			return;
		//se non ho specificato il flag, faccio toggle in base a cosa ho
		let { activeTags = [] }  = troopDetails[attack_id];
		if(insertFlag === null)
			insertFlag = !activeTags.includes(tag_id);

		if(insertFlag)
			Vue.set(troopDetails[attack_id], 'activeTags', [...activeTags, tag_id]);
		else
			Vue.set(troopDetails[attack_id], 'activeTags', activeTags.filter(id => id !== tag_id));
	},

};
