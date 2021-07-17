<template>
	<v-alert
		border="left"
		colored-border
		:type="alertVariantAttackDetail(category)"
		elevation="2"
	>
		<div class="alert-header">
			<h3>
				<time :datetime="startDatetime">
					<span class="text--disabled">{{ start[0] }}</span>
					{{ start[1] }}
				</time>
				<v-icon class="mr-2 ml-2">mdi-arrow-right</v-icon>
				<time :datetime="arrivalDatetime">
					<span class="text--disabled">{{ arrival[0] }}</span>
					{{ arrival[1] }}
				</time>
			</h3>
		</div>

		<v-divider
			class="my-4 info"
			style="opacity: 0.22"
		/>

		<div class="alert-body mt-5">

			<div class="text-center mb-5">
				({{ targetName }}) {{ targetCityLabel }}
				<v-btn
					class="ma-2"
					outlined
					color="yellow"
					:href="'https://'+serverName+'/karte.php?x='+targetCityCoordinates[0]+'&y='+targetCityCoordinates[1]"
				>
					({{ targetCityCoordinates[0] + '|' + targetCityCoordinates[1] }})
				</v-btn>

				<v-icon class="mr-2 ml-2">mdi-arrow-right</v-icon>
				({{ senderName }}) {{ senderCityLabel }}
				<v-btn
					class="ma-2"
					outlined
					color="yellow"
					:href="'https://'+serverName+'/karte.php?x='+senderCityCoordinates[0]+'&y='+senderCityCoordinates[1]"
				>
					({{ senderCityCoordinates[0] + '|' + senderCityCoordinates[1] }})
				</v-btn>
			</div>

			<v-chip
				v-for="(item, index) in troopTimesFiltered"
				:key="'badge-a-'+index"
				class="ma-2"
				text-color="white"
			>
				<v-avatar
					left
					:color="item.userRisk === 5 ? 'red' : item.userRisk > 4 ? 'yellow' : 'green'"
				>
					{{ item.arena }}
				</v-avatar>
				<v-avatar
					color="black"
				>
					<b>{{item.speed}}</b>
				</v-avatar>
				<time class="ml-2">{{ secondsToTime(item.time) }}</time>
			</v-chip>
		</div>

		<v-divider
			class="my-4 info"
			style="opacity: 0.22"
		/>

		<div class="alert-footer d-flex">
			<v-btn
				color="info"
				outlined
				@click="$emit('button:remove')"
			>
				remove
			</v-btn>
			<v-btn
				color="error"
			>
				danger
			</v-btn>
		</div>
	</v-alert>
</template>


<script lang="ts">
import Vue, { PropOptions } from 'vue';
import { mapState } from 'vuex';
import { secondsToTime } from '@/assets/js/temporary';
import dayjs from 'dayjs';

import {
	troopTimesEvaluated,
	troopDetailCategoryEnum,
} from '@/interfaces';


const Component = Vue.extend({
	name: 'card-collection',
	props: {
		id: {
			type: String,
			required: true,
		} as PropOptions<string>,
		category: {
			type: String,
			required: true,
		} as PropOptions<troopDetailCategoryEnum>,

		targetName: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,
		targetCityLabel: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,
		targetCityCoordinates: {
			type: Array,
			default: () => {
				return ['0','0'];
			}
		} as PropOptions<string[]>,

		senderName: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,
		senderCityLabel: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,
		senderCityCoordinates: {
			type: Array,
			default: () => {
				return ['0','0'];
			}
		} as PropOptions<string[]>,

		startDatetime: {
			type: Date,
			default: () => {
				return new Date();
			}
		} as PropOptions<Date>,
		arrivalDatetime: {
			type: Date,
			default: () => {
				return new Date();
			}
		} as PropOptions<Date>,

		troopTimes: {
			type: Array,
			default: () => {
				return [];
			}
		} as PropOptions<troopTimesEvaluated[]>,
		riskLimit: {
			type: Number,
			default: () => {
				return 10;
			}
		} as PropOptions<number>,
	},
	computed: {
		...mapState({
			serverName: (state :any) => state.serverData.serverName,
		}),

		troopTimesFiltered() :troopTimesEvaluated[] {
			return this.troopTimes
				.filter(({ userRisk = 0 }) => {
					return userRisk >= this.riskLimit;
				})
				.sort(function({ userRisk: aR, speed :aS, arena: aA } :troopTimesEvaluated, { userRisk: bR, speed :bS, arena: bA } :troopTimesEvaluated) {
					return aR - bR;
					//TODO multipli ordini
					//return aR*10000 - aS*100 - aA - bR*10000 - bS*100 - bA;
				});
		},

		start () :string[] {
			return dayjs(this.startDatetime).format('DD/MM/YYYY HH:mm:ss').split(" ");
		},
		arrival () :string[] {
			return dayjs(this.arrivalDatetime).format('DD/MM/YYYY HH:mm:ss').split(" ");
		},
	},
	methods: {
		alertVariantAttackDetail(category :string) :string {
			if(category === troopDetailCategoryEnum.outRaid)
				return 'info';
			if(category === troopDetailCategoryEnum.outAttack)
				return 'info';
			if(category === troopDetailCategoryEnum.outSupply)
				return 'info';
			if(category === troopDetailCategoryEnum.inRaid)
				return 'warning';
			if(category === troopDetailCategoryEnum.inAttack)
				return 'error';
			if(category === troopDetailCategoryEnum.inSupply)
				return 'success';
			return 'info';
		},

		secondsToTime(seconds :number) :string {
			return secondsToTime(seconds);
		},
	},
});

export default Component;
</script>
