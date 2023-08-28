<template>
	<v-dialog
		v-model="trueShow"
		class="attack-detail-modal"
		persistent
		max-width="600px"
	>
	<v-card>
		<v-toolbar
			flat
			dark
			color="primary"
		>
			<v-toolbar-title>
				{{ modalTitle }}
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn
				icon
				dark
				@click="emitClose"
			>
				<v-icon>mdi-close</v-icon>
			</v-btn>
		</v-toolbar>

		<v-card-text v-if="Object.keys(data).length > 0">

			<h4 class="section-title">{{ $t('troop-details.modal-insert.attack-sender-title') }}</h4>
			<div class="row">
	            <div class="col-12 col-md-4">
	                <v-text-field
	                    v-model="data.senderName"
	                    :label="$t('generic.nickname')"
	                />
	            </div>
	            <div class="col-12 col-md-4">
	                <v-text-field
	                    v-model="data.senderCityLabel"
	                    :label="$t('generic.village')"
	                />
	            </div>
	            <div class="col-6 col-md-4">
					<div class="d-flex">
						<v-text-field
							v-model="data.senderCityCoordinates[0]"
							class="mx-1"
							type="number"
							outlined
							label="X"
						/>
						<v-text-field
							v-model="data.senderCityCoordinates[1]"
							class="mx-1"
							type="number"
							outlined
							label="Y"
						/>
					</div>
	            </div>
	        </div>

			<h4 class="section-title">{{ $t('troop-details.modal-insert.attack-target-title') }}</h4>
			<div class="row">
	            <div class="col-12 col-md-4">
	                <v-text-field
	                    v-model="data.targetName"
	                    :label="$t('generic.nickname')"
	                />
	            </div>
	            <div class="col-12 col-md-4">
	                <v-text-field
	                    v-model="data.targetCityLabel"
	                    :label="$t('generic.village')"
	                />
	            </div>
				<div class="col-6 col-md-4">
					<div class="d-flex">
						<v-text-field
							v-model="data.targetCityCoordinates[0]"
							class="mx-1"
							type="number"
							outlined
							label="X"
						/>
						<v-text-field
							v-model="data.targetCityCoordinates[1]"
							class="mx-1"
							type="number"
							outlined
							label="Y"
						/>
					</div>
	            </div>
	        </div>

			<v-divider
				class="half-divider mb-10 mt-5"
			/>

			<div class="row">

				<div class="col-12 col-md-6">
					<v-select
						v-model="data.category"
						:items="selectTroopDetailCategory"
						prepend-icon="mdi-sword-cross"
						:label="$t('generic.category')"
					/>
				</div>

				<div class="col-6 col-md-3">
					<v-select
						v-model="data.boots"
						:items="bonusBoots"
						:label="$t('generic.boots')"
						prepend-icon="mdi-shoe-print"
					/>
				</div>
				<div class="col-6 col-md-3">
					<v-select
						v-model="data.artifact"
						:items="bonusArtifact"
						:label="$t('generic.artifact')"
						prepend-icon="mdi-star"
					/>
				</div>


				<div class="col-12 col-md-6">
					<p class="record-label text-center">
						{{ $t('troop-details.modal-insert.spottedTime') }}
					</p>
					<div class="d-flex justify-center align-center">
						<v-dialog
							ref="inputDialog"
							v-model="modalSpottedDate"
							:return-value.sync="data.spottedDate"
							width="290px"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-tooltip bottom>
									<template v-slot:activator="{ on, attrs }">
										<v-btn
											class="mr-2"
											icon
											plain
											v-bind="attrs"
											v-on="on"
											@click="modalSpottedDate = true"
										>
											<v-icon>mdi-calendar</v-icon>
										</v-btn>
									</template>
									<span>{{ $t('troop-details.modal-insert.spottedDate') }}</span>
								</v-tooltip>
							</template>
							<v-date-picker
								v-if="modalSpottedDate"
								v-model="data.spottedDate"
								full-width
							>
								<v-spacer></v-spacer>
								<v-btn
									text
									color="primary"
									@click="modalSpottedDate = false"
								>
									OK
								</v-btn>
							</v-date-picker>
						</v-dialog>
						<v-dialog
							ref="inputDialog"
							v-model="modalSpottedTime"
							:return-value.sync="data.spottedTime"
							width="290px"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-btn
									class="mr-2"
									icon
									plain
									v-bind="attrs"
									v-on="on"
								>
									<v-icon>mdi-clock-outline</v-icon>
								</v-btn>
							</template>
							<v-time-picker
								v-if="modalSpottedTime"
								v-model="data.spottedTime"
								full-width
								use-seconds
								format="24hr"
							>
								<v-spacer></v-spacer>
								<v-btn
									text
									color="primary"
									@click="modalSpottedTime = false"
								>
									OK
								</v-btn>
							</v-time-picker>
						</v-dialog>
						<v-text-field
							v-model="data.spottedTime"
							class="text-center"
							hide-details
							color="success"
							filled
							rounded
							dense
						/>
					</div>
				</div>

				<div class="col-12 col-md-6">
					<p class="record-label text-center">
						{{ $t('troop-details.modal-insert.spottedTime') }}
					</p>
					<div class="d-flex justify-center align-center">
						<v-dialog
							ref="inputDialog"
							v-model="modalArrivalDate"
							:return-value.sync="data.arrivalDate"
							width="290px"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-tooltip bottom>
									<template v-slot:activator="{ on, attrs }">
										<v-btn
											class="mr-2"
											icon
											plain
											v-bind="attrs"
											v-on="on"
											@click="modalArrivalDate = true"
										>
											<v-icon>mdi-calendar</v-icon>
										</v-btn>
									</template>
									<span>{{ $t('troop-details.modal-insert.spottedDate') }}</span>
								</v-tooltip>
							</template>
							<v-date-picker
								v-if="modalArrivalDate"
								v-model="data.arrivalDate"
								full-width
							>
								<v-spacer></v-spacer>
								<v-btn
									text
									color="primary"
									@click="modalArrivalDate = false"
								>
									OK
								</v-btn>
							</v-date-picker>
						</v-dialog>
						<v-dialog
							ref="inputDialog"
							v-model="modalArrivalTime"
							:return-value.sync="data.arrivalTime"
							width="290px"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-btn
									class="mr-2"
									icon
									plain
									v-bind="attrs"
									v-on="on"
								>
									<v-icon>mdi-clock-outline</v-icon>
								</v-btn>
							</template>
							<v-time-picker
								v-if="modalArrivalTime"
								v-model="data.arrivalTime"
								full-width
								use-seconds
								format="24hr"
							>
								<v-spacer></v-spacer>
								<v-btn
									text
									color="primary"
									@click="modalArrivalTime = false"
								>
									OK
								</v-btn>
							</v-time-picker>
						</v-dialog>
						<v-text-field
							v-model="data.arrivalTime"
							class="text-center"
							hide-details
							color="success"
							filled
							rounded
							dense
						/>
					</div>
				</div>

				<div class="col-12">
					<v-slider
						v-model="data.gapSeconds"
						:label="$t('troop-details.modal-insert.gapSeconds')"
						class="pt-10"
						thumb-color="red"
						thumb-label="always"
						step="600"
						min="600"
						max="43200"
					>
						<template v-slot:thumb-label>
						  {{ gapTime }}
						</template>
					</v-slider>
				</div>

			</div>

			<v-divider
				class="half-divider mb-10 mt-5"
			/>

			<v-textarea
				v-model="data.note"
				filled
				:label="$t('generic.note')"
			/>

			<v-autocomplete
              v-model="data.activeTags"
              :items="availableTags"
              filled
              chips
              color="blue-grey lighten-2"
              :label="$t('troop-details.modal-insert.activeTags')"
              item-text="labelKey"
              item-value="id"
              multiple
            >
              <template v-slot:selection="data">
                <v-chip
                  v-bind="data.attrs"
                  :input-value="data.selected"
                  close
                  @click="data.select"
                >
                  <v-avatar left>
                    <v-icon>{{ data.item.icon }}</v-icon>
                  </v-avatar>
                  {{ data.item.labelKey }}
                </v-chip>
              </template>
              <template v-slot:item="{ item  }">
                <template>
                  <v-list-item-avatar>
					<v-icon>{{ item.icon }}</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ $t(item.labelKey) }}</v-list-item-title>
                  </v-list-item-content>
                </template>
              </template>
            </v-autocomplete>

		</v-card-text>


		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn
				color="blue darken-1"
				text
				@click="resetEdits"
			>
				Reset
			</v-btn>
			<v-btn
				color="blue darken-1"
				text
				@click="$emit('button:save', data)"
			>
				Save
			</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue, { PropOptions, VueConstructor } from 'vue';
import { mapState, mapGetters } from 'vuex';

import { cloneDeep } from 'lodash';
import { secondsToTime } from '@/assets/js/temporary';
import showStructureMixin from './mixins/defaultShowStructure';

/*
import {
	LocaleMessages,
} from 'vue-i18n';
TODO?
*/

import {
    troopsFinalMap,
	troopDetailCategoryEnum,
} from '@/interfaces';

export default (Vue as VueConstructor<Vue & InstanceType<typeof showStructureMixin>>).extend({
	name: 'edit-attack-detail',
	mixins: [
		showStructureMixin
	],
	props: {
		id: {
			type: String,
			required: true,
		} as PropOptions<string>,
	},
	data: () => ({
		data: {} as troopsFinalMap,
		modalSpottedTime: false as boolean,
		modalSpottedDate: false as boolean,
		modalArrivalTime: false as boolean,
		modalArrivalDate: false as boolean,
	}),
	watch:{
		id(id :string) :void {
			this.resetEdits();
		},
	},
	computed: {
		...mapState({
			serverName: (state :any) => state.serverData.serverName,
			availableTags: (state :any) => Object.values(state.appData.attackTags),
		}),
		...mapState([
			'bonusBoots',
			'bonusArtifact',
		]),
		...mapGetters([
			'getTroopDetail',
			'factoryTroopDetail',
		]),
		modalTitle() :string {
			if(!this.data.senderName || !this.data.targetName)
				return this.$t('attack-modal-title-new') as string;
			return this.$t('attack-modal-title', {
				sender: this.data.senderName,
				target: this.data.targetName,
				arrival: this.data.arrivalTime,
			}) as string;
		},
		gapTime() :string {
			let temp = secondsToTime(this.data.gapSeconds).split(":");
			temp.pop();
			return temp.join(":");
		},
		selectTroopDetailCategory() :any[] {
			const keys = Object.values(troopDetailCategoryEnum);
			let i :number,
				len = keys.length,
				tempArray :any[] = [];
			for(i = 0; i < len; i++)
				tempArray.push({
					text: this.$t('generic.attack-categories.troop-detail-category-enum-label-'+keys[i]),
					value: keys[i],
				});
			return tempArray;
		},
	},
	methods: {
		resetEdits() :void {
			this.data = cloneDeep(this.getTroopDetail(this.id) || this.factoryTroopDetail());
		},
	},
});
</script>

<style lang="scss">
.attack-detail-modal{
	.record-label{

	}
	.section-title{
		font-size: 2em;
	}
}
</style>
