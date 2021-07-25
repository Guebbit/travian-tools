import { stateMap } from '@/interfaces';

//TODO nuxt $t in store?
const $t = (text :string) => {
	return text;
};

export default () :stateMap => {
	return {
		debug: false,
		loading: {},
		troopDetails: {},
		serverData: {
			serverName: 'ts2.travian.it',
			mapSize: 401,	//+1?
			speed: 1,
			arenaCap: 20,
		},
		gameData: {
			troopsData: [
				{
					speed: 3,
					name: $t('Catapulta'),
					image: undefined,
				},
				{
					speed: 4,
					name: $t('Ariete, senatore'),
					image: undefined,
				},
				{
					speed: 5,
					name: $t('Pretoriano, Colono, Capo tribù'),
					image: undefined,
				},
				{
					speed: 6,
					name: $t('Legionario, Ascia, Spada'),
					image: undefined,
				},
				{
					speed: 7,
					name: $t('Imperiano, Mazza, Alabarda, Falange'),
					image: undefined,
				},
				{
					speed: 9,
					name: $t('Esploratore, Cavaliere Teutonico'),
					image: undefined,
				},
				{
					speed: 10,
					name: $t('Cavaliere di Cesare, Paladino'),
					image: undefined,
				},
				{
					speed: 13,
					name: $t('Haeduan'),
					image: undefined,
				},
				{
					speed: 14,
					name: $t('Cavaliere del Generale'),
					image: undefined,
				},
				{
					speed: 16,
					name: $t('Emissario, Druido'),
					image: undefined,
				},
				{
					speed: 17,
					name: $t('Ricognitore'),
					image: undefined,
				},
				{
					speed: 19,
					name: $t('Teutates'),
					image: undefined,
				},
			],
		},
	}
}
