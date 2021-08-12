<template>
	<v-card class="attack-detail-card my-4">
		<v-app-bar
			:color="attackColor"
			elevate-on-scroll
		>
			<v-icon
				class="mr-4"
			>
				{{ icon }}
			</v-icon>
			<v-toolbar-title
				class="d-flex justify-center align-center"
			>
				<time :datetime="spottedDatetime">
					<small class="text--disabled">
						{{ spottedDateFormatted }}
					</small>
					{{ spottedTime }}
				</time>
				<v-icon class="mr-2 ml-2">mdi-arrow-right</v-icon>
				<time :datetime="arrivalDatetime">
					<small class="text--disabled">
						{{ arrivalDateFormatted }}
					</small>
					{{ arrivalTime }}
				</time>
			</v-toolbar-title>

			<v-spacer></v-spacer>

			<v-speed-dial
				v-model="showTagSelector"
				direction="left"
				transition="slide-x-transition-reverse"
			>
				<template v-slot:activator>
					<v-btn
						icon
						v-model="showTagSelector"
					>
						<v-icon v-if="showTagSelector">mdi-close</v-icon>
						<v-icon v-else>mdi-tag-plus</v-icon>
					</v-btn>
				</template>
				<v-btn
					v-for="tag in availableTags"
					fab
					:small="!tags.includes(tag.id)"
					:color="tag.color"
					@click.prevent.stop="toggleTagAttack([id, tag.id])"
				>
					<v-icon>{{ tag.icon }}</v-icon>
				</v-btn>
			</v-speed-dial>

			<v-btn
				icon
				@click = "$emit('button:edit', id)"
			>
				<v-icon>mdi-pencil</v-icon>
			</v-btn>
			<v-btn icon
				@click="$emit('button:remove', id)"
			>
				<v-icon>mdi-close</v-icon>
			</v-btn>
		</v-app-bar>
		<v-card-text>
			<div class="text-right">
				<v-btn
					v-for="tag in availableTags"
					v-show="tags.includes(tag.id)"
					class="mx-1"
					fab
					small
					:color="tag.color"
				>
					<v-icon>{{ tag.icon }}</v-icon>
				</v-btn>
			</div>
			<div class="text-center mb-5">
				<span>({{ senderName }}) {{ senderCityLabel }}</span>
				<v-btn
					class="ma-2"
					outlined
					color="yellow"
					target="_blank"
					:href="'https://'+serverName+'/karte.php?x='+senderCityCoordinates[0]+'&y='+senderCityCoordinates[1]"
				>
					({{ senderCityCoordinates[0] + '|' + senderCityCoordinates[1] }})
				</v-btn>

				<v-icon class="mr-2 ml-2">mdi-arrow-right</v-icon>

				<span>({{ targetName }}) {{ targetCityLabel }}</span>
				<v-btn
					class="ma-2"
					outlined
					color="yellow"
					target="_blank"
					:href="'https://'+serverName+'/karte.php?x='+targetCityCoordinates[0]+'&y='+targetCityCoordinates[1]"
				>
					({{ targetCityCoordinates[0] + '|' + targetCityCoordinates[1] }})
				</v-btn>

				<v-textarea
					filled
					:label="$t('Note')"
					:value="attackNote"
				/>
			</div>
			<v-divider
				class="my-4"
				:class="[attackColor]"
			/>
			<div>
				<v-chip
					v-for="(item, index) in troopTimesFiltered"
					:key="'badge-a-'+index"
					class="ma-2"
					text-color="white"
				>
					<v-avatar
						left
						:color="item.risk === 5 ? 'red' : item.risk > 3 ? 'orange' : 'green'"
					>
						{{ item.arena }}
					</v-avatar>
					<v-icon>mdi-shoe-print</v-icon>
					<b>{{item.speed}}</b>
					<v-icon>mdi-timer-outline</v-icon>
					<time class="ml-2">{{ secondsToTime(item.time) }}</time>
					<template v-if="item.boots != 0">
						<v-icon>mdi-shoe-print</v-icon>
						<b>{{item.boots}}</b>
					</template>
					<template v-if="item.artifact != 100">
						<v-icon>mdi-star</v-icon>
						<b>{{item.artifact}}</b>
					</template>
				</v-chip>
			</div>
			<v-divider
				class="my-4"
				:class="[attackColor]"
			/>
		</v-card-text>

		<v-card-actions>
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
		</v-card-actions>
	</v-card>
</template>


<script lang="ts">
import Vue, { PropOptions } from 'vue';
import { mapState, mapActions } from 'vuex';

import dayjs from 'dayjs';
import { secondsToTime } from '@/assets/js/temporary';

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
		tags: {
			type: Array,
			default: () => {
				return [];
			}
		} as PropOptions<string[]>,

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

		spottedDate: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,
		spottedTime: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,
		arrivalDate: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,
		arrivalTime: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,
		note: {
			type: String,
			default: () => {
				return '';
			}
		} as PropOptions<string>,

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
	data() {
		return {
			showTagSelector: false as boolean,
		}
	},

	computed: {
		...mapState({
			serverName: (state :any) => state.serverData.serverName,
			availableTags: (state :any) => Object.values(state.appData.attackTags),
		}),

		troopTimesFiltered() :troopTimesEvaluated[] {
			return this.troopTimes
				.filter(({ risk = 0 }) => {
					return risk >= this.riskLimit;
				})
				.sort(function({ risk: aR, speed :aS, arena: aA } :troopTimesEvaluated, { risk: bR, speed :bS, arena: bA } :troopTimesEvaluated) {
					return aR - bR;
					//TODO multipli ordini
					//return aR*10000 - aS*100 - aA - bR*10000 - bS*100 - bA;
				});
		},

		attackNote: {
			get() :string {
				return this.note;
			},
			set(text :string) {
				this.setAttackNote([this.id, text]);
			}
		},


		spottedDatetime() :Date {
			return new Date(this.spottedDate + " " + this.spottedTime);
		},
		arrivalDatetime() :Date {
			return new Date(this.arrivalDate + " " + this.arrivalTime);
		},
		spottedDateFormatted() :string {
			return dayjs(this.spottedDate).format('DD/MM/YYYY');
		},
		arrivalDateFormatted() :string {
			return dayjs(this.arrivalDate).format('DD/MM/YYYY');
		},


		icon() :string {
			if(this.category === troopDetailCategoryEnum.outRaid)
				return 'mdi-sword-cross';
			if(this.category === troopDetailCategoryEnum.outAttack)
				return 'mdi-sword-cross';
			if(this.category === troopDetailCategoryEnum.outSupply)
				return 'mdi-shield';
			if(this.category === troopDetailCategoryEnum.inRaid)
				return 'mdi-sword-cross';
			if(this.category === troopDetailCategoryEnum.inAttack)
				return 'mdi-sword-cross';
			if(this.category === troopDetailCategoryEnum.inSupply)
				return 'mdi-shield';
			return '';
		},

		attackColor() :string {
			if(this.category === troopDetailCategoryEnum.outRaid)
				return 'info';
			if(this.category === troopDetailCategoryEnum.outAttack)
				return 'info';
			if(this.category === troopDetailCategoryEnum.outSupply)
				return 'info';
			if(this.category === troopDetailCategoryEnum.inRaid)
				return 'warning';
			if(this.category === troopDetailCategoryEnum.inAttack)
				return 'error';
			if(this.category === troopDetailCategoryEnum.inSupply)
				return 'success';
			return 'info';
		},
	},
	methods: {
		...mapActions([
			'setAttackNote',
			'toggleTagAttack',
		]),
		secondsToTime(seconds :number) :string {
			return secondsToTime(seconds);
		},
	},
});

export default Component;
</script>

<style lang="scss">
.attack-detail-card{

}
</style>
