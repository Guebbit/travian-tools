<template>
    <div>
        <div class="mb-10">
            <h1>Lettura Base Militare ALPHA</h1>
            <p>
                <b>NON</b> considera artefatti o equipaggiamento eroe!
            </p>
        </div>
        <div class="row">
            <div class="col-12 col-md-6">
                Il tempo che è passato dall'ultima volta che avete guardato la caserma e NON c'erano attacchi
            </div>
            <div class="col-12 col-md-6">
                <v-slider
                    v-model="gapSeconds"
                    class="pt-10"
                    label="AFK"
                    thumb-color="red"
                    thumb-label="always"
                    step="600"
                    min="600"
                    max="43200"
                >
                    <template v-slot:thumb-label="">
                      {{ gapTime }}
                    </template>
                </v-slider>
            </div>
            <div class="col-12 col-md-6" v-show="false">
                <v-dialog
                    ref="inputDialog"
                    v-model="modalInputSpottedTime"
                    :return-value.sync="inputSpottedTime"
                    persistent
                    width="290px"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="inputSpottedTime"
                            prepend-icon="mdi-clock-time-four-outline"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        />
                    </template>
                    <v-time-picker
                        v-if="modalInputSpottedTime"
                        v-model="inputSpottedTime"
                        full-width
                        format="24hr"
                    >
                        <v-spacer></v-spacer>
                        <v-btn
                            text
                            color="primary"
                            @click="modalInputSpottedTime = false"
                        >
                            Cancel
                        </v-btn>
                        <v-btn
                            text
                            color="primary"
                            @click="$refs.inputDialog.save(inputSpottedTime)"
                        >
                            OK
                        </v-btn>
                    </v-time-picker>
                </v-dialog>
            </div>
        </div>

        <div class="row">
            <div class="col-12 col-md-6">
                attacchi visibili
            </div>
            <div class="col-12 col-md-6">
                <v-autocomplete
                    v-model="categories"
                    :items="selectTroopDetailCategory"
                    chips
                    multiple
                />
            </div>
            <div class="col-12 col-md-6">
                Filtro delle possibili arene:
                5 = alto rischio (cata per ora), 0 = rischio nullo
            </div>
            <div class="col-12 col-md-6">
                <v-slider
                    v-model="riskLimit"
                    label="rischio"
                    thumb-color="red"
                    thumb-label="always"
                    min="0"
                    max="5"
                />
            </div>
            <div class="col-12 col-md-6">
                Fate CTRL+A della vostra caserma e poi incollate qui dentro.
                Se avete più pagine fatelo di tutte le pagine (nelle opzioni si può aumentare il numero ma non è necessario)
            </div>
            <div class="col-12 col-md-6">
                <div ref="casermaRaw"
                    class="caserma-insert-data"
                    contenteditable
                    @input="casermaTranslate"
                />
            </div>
        </div>

        <div class="mt-100">
            <br /><br /><br />
            <v-divider
                class="my-5 error"
            />
            <p>
                Qui sotto appariranno i vari attacchi che state ricevendo e, per ognuno, le possibili combinazioni di
                "ARENA - Velocità truppe - Orario di percorrenza"
                Se non vedete niente significa che è un bug del programma o non hanno inviato cata, provate ad abbassare la barra di "rischio"
            </p>
            <v-divider
                class="my-5 error"
            />
            <div class="attacks-wrapper">
                <attack-card
                    v-for = "attack in filteredTroopMovements"
                    :key                =  "'attack-details-'+attack.id"
                    :id                 = "attack.id"
                    :category           = "attack.category"
                    :activeTags         = "attack.activeTags"

                    :targetName         = "attack.targetName"
                    :targetCityLabel    = "attack.targetCityLabel"
                    :targetCityCoordinates = "attack.targetCityCoordinates"
                    :senderName         = "attack.senderName"
                    :senderCityLabel    = "attack.senderCityLabel"
                    :senderCityCoordinates = "attack.senderCityCoordinates"

                    :spottedDate        = "attack.spottedDate"
                    :spottedTime        = "attack.spottedTime"
                    :arrivalDate        = "attack.arrivalDate"
                    :arrivalTime        = "attack.arrivalTime"
                    :note               = "attack.note"

                    :troopTimes         = "troopTimes.hasOwnProperty(attack.id) ? troopTimes[attack.id] : []"
                    :riskLimit          = "riskLimit"

                    @button:remove      = "removeAttackDetail"
                    @button:edit        = "(value) => { showEditModal = true; editableAttackId = value; }"
                />

                <pre v-if="debug">{{filteredTroopMovements}}</pre>
                <pre v-if="debug">{{troopTimes}}</pre>
            </div>
            <attack-modal
                :show="showEditModal"
                @input="(value) => { showEditModal = value }"
                :id = "editableAttackId"
                @button:save = "patchAttackDetail"
            />
        </div>

    </div>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

import dayjs from 'dayjs';
import { secondsToTime } from '@/assets/js/temporary';

import attackCard from '@/components/cards/attackDetailCard.vue';
import attackModal from '@/components/modals/attackDetailModal.vue';

import {
    troopsElementMap,
    troopsRawMap,
    troopsFinalMap,
    troopTimesEvaluated,
    troopDetailCategoryEnum,
} from '@/interfaces';

interface vueRefsMap {
	$refs: {
		casermaRaw :HTMLPictureElement,
        inputDialog :HTMLElement,
	}
}

export default (Vue as VueConstructor<Vue & vueRefsMap>).extend({
	name: 'testpage',
    components: {
        attackCard,
        attackModal,
    },
	data() {
		return {
            //elements
            modalInputSpottedTime: false as boolean,
            showEditModal: false as boolean,
            editableAttackId: '' as string,
            //generic value changers
            //options
            targetName: '' as string,
            targetCityLabel: '' as string,
            targetCityCoordinates: ['0', '0'] as string[],
            gapSeconds: 600 as number,
            inputSpottedTime: null as string | null,
            //filters
            riskLimit: 5 as number,
            categories: ['inAttack'] as string[],
		}
	},
	computed: {
        ...mapState({
            debug: (state :any) => state.debug,
            troopDetails: (state :any) :Record<string,troopsFinalMap> => state.troopDetails,
            troopTimes: (state :any) :Record<string,troopTimesEvaluated[]> => state.troopTimes,
        }),
        ...mapGetters([
            'getStringDateFromDate',
            'getTroopsFromLocal',
            'getBasicDataFromLocal',
            'getSecureArrivalDatetime',
        ]),

        loadingPromise() :Promise<any> {
            return Promise.all([
                this.fetchTroopDetails(),     //TODO cercare solo tramite admin\user key-pair
            ]);
        },

        filteredTroopMovements() :troopsFinalMap[] {
            return (Object.values(this.troopDetails) as troopsFinalMap[]).filter(({ category } :troopsFinalMap) => {
                return this.categories.includes(category);
    		});
        },

        inputSpottedDatetime() :Date | false {
            if(!this.inputSpottedTime)
                return false;
            return new Date(this.getStringDateFromDate() + " " + this.inputSpottedTime);
        },

        selectTroopDetailCategory() :any[] {
            const keys = [
                'inAttack',
                'inRaid',
                'inSupply',
                'inReturn',
            ];
            let i :number,
                tempArray :any[] = [];
            for(i = keys.length; i--; )
                tempArray.push({
                    text: this.$t('generic.attack-categories.troop-detail-category-enum-label-'+keys[i]),
                    value: keys[i],
                });
            return tempArray;
        },

        gapTime() :string {
            let temp = secondsToTime(this.gapSeconds).split(":");
            temp.pop();
            return temp.join(":");
        },
	},
	methods: {
        ...mapMutations([
            'setLoading',
        ]),
        ...mapActions([
            'patchTroopDetails',
            'calculateTroopsFinal',
            'fetchTroopDetails',
        ]),

        casermaTranslate() :void {
            let tempArray :Record<string,unknown>[] = [],
                i :number;
            if(!this.$refs.casermaRaw)
                return;
            const nodeList :NodeListOf<Element> = this.$refs.casermaRaw.querySelectorAll(".troop_details");
            // qualcosa è andato storto
            if(!nodeList || nodeList.length < 1)
                return;
            const basicData = this.getBasicDataFromLocal(this.$refs.casermaRaw);

            if(this.inputSpottedDatetime){
                basicData.spottedDate = dayjs(this.inputSpottedDatetime).format('YYYY-MM-DD');
                basicData.spottedTime = dayjs(this.inputSpottedDatetime).format('HH:mm:ss');
            }

            // tutti le varie <table> .troop_details in cui sono contenute tutte le info dell'attacco
            for(i = nodeList.length; i--; )
                tempArray.push(this.getTroopsFromLocal(nodeList[i]));
            tempArray = tempArray.filter(Boolean);

            for(i = tempArray.length; i--; ){
                const arrivalDatetime = this.getSecureArrivalDatetime(tempArray[i].arrivalTime, tempArray[i].attackCountdown, tempArray[i].spottedDatetime);
                this.calculateTroopsFinal({
                    ...basicData,
                    ...tempArray[i],
                    // siccome c'è sempre un lagg di qualche secondo, lo uso solo per ricavare il giorno e sostituisco l'ora con quella "esatta"
                    arrivalDate: dayjs(arrivalDatetime).format('YYYY-MM-DD'),
            		arrivalTime: dayjs(arrivalDatetime).format('HH:mm:ss'),
                    gapSeconds: this.gapSeconds,
                    artifact: 100,
                    boots: 0,
                } as troopsRawMap);
            }
        },

        removeAttackDetail(id :string){
            console.log("REMOVE", id);
        },

        patchAttackDetail(troopData :troopsFinalMap){
            this.patchTroopDetails(troopData);
        },
	},

    created(){
		this.setLoading(['items', true]);
		this.loadingPromise.finally(() => {
			this.setLoading(['items', false]);
		})
	},

    mounted(){
        /**/
        this.calculateTroopsFinal(
            {
            "category": "inAttack",
            "senderName": "The crazy",
            "senderCityLabel": "00. Good Vibes",
            "senderCityCoordinates": [
              "5",
              "-76"
            ],
            "arrivalTime": "07:11:15",
            "attackCountdown": "11:37:00",
            //"spottedDatetime": new Date("2021-07-17T17:34:15.000Z"),
            spottedDate: dayjs(new Date("2021-07-17T17:34:15.000Z")).format('YYYY-MM-DD'),
            spottedTime: dayjs(new Date("2021-07-17T17:34:15.000Z")).format('HH:mm:ss'),
            "targetName": "zxc",
            "targetCityLabel": "01 Lions",
            "targetCityCoordinates": [
              "45",
              "-29"
            ],
            "gapSeconds": 600,
            "id": "g4f969f2-09a5-43dd-97d9-1b04b93ea665",
            //"arrivalDatetime": new Date("2021-07-18T05:11:15.000Z"),
            arrivalDate: dayjs(new Date("2021-07-18T05:11:15.000Z")).format('YYYY-MM-DD'),
            note: 'ciaone',
            activeTags: [],
            artifact: 100,
            boots: 0,
            }
        );
        this.calculateTroopsFinal(
            {
              "category": "inAttack",
              "senderName": "Avana9",
              "senderCityLabel": "Kill Bill",
              "senderCityCoordinates": [
                "21",
                "-35"
              ],
              "arrivalTime": "08:22:18",
              "attackCountdown": "6:56:33",
              //"spottedDatetime": new Date("2021-07-18T23:27:45.000Z"),
              spottedDate: dayjs(new Date("2021-07-18T23:27:45.000Z")).format('YYYY-MM-DD'),
              spottedTime: dayjs(new Date("2021-07-18T23:27:45.000Z")).format('HH:mm:ss'),
              "targetName": "zxc",
              "targetCityLabel": "01 Lions",
              "targetCityCoordinates": [
                "45",
                "-29"
              ],
              "gapSeconds": 600,
              "id": "gb91e346-1c99-4628-b6e1-67d9f25f836b",
              //"arrivalDatetime": new Date("2021-07-19T06:22:18.000Z"),
                arrivalDate: dayjs(new Date("2021-07-19T06:22:18.000Z")).format('YYYY-MM-DD'),
              note: 'zzzzzzzzz',
              activeTags: [],
              artifact: 100,
              boots: 0,
            }
        );
        /**/
    },
});
</script>

<style lang="scss">
    .v-input{
        &.text-center{
            input{
                text-align: center;
            }
        }
    }
    .v-divider{
        &.half-divider{
            width: 50%;
            margin: 0 auto;
        }
    }
    .caserma-insert-data{
        height:100px;
        background:black;
        overflow:hidden;
        & > *{
            display: none;
        }
    }
</style>
