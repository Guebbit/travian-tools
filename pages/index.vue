<template>
    <div>
        <!--
        <div class="row">
            <div class="col-12 col-md-4">
                <v-text-field
                    v-model="targetName"
                    label="Nickname"
                />
            </div>
            <div class="col-12 col-md-4">
                <v-text-field
                    v-model="targetCityLabel"
                    label="Villaggio"
                />
            </div>
            <div class="col-6 col-md-2">
                <v-text-field
                    v-model="targetCityCoordinates[0]"
                    type="number"
                    filled
                    label="X"
                />
            </div>
            <div class="col-6 col-md-2">
                <v-text-field
                    v-model="targetCityCoordinates[1]"
                    type="number"
                    filled
                    label="Y"
                />
            </div>
        </div>
        -->
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
                    v-model="gapMinutes"
                    class="pt-10"
                    label="AFK"
                    thumb-color="red"
                    thumb-label="always"
                    step="10"
                    min="10"
                    max="720"
                >
                    <template v-slot:thumb-label="{ value }">
                      {{ secondsToTimeAltered(value*60) }}
                    </template>
                </v-slider>
            </div>
            <div class="col-12 col-md-6" v-show="false">
                <v-dialog
                    ref="dialog"
                    v-model="modalInputSpottedTime"
                    :return-value.sync="time"
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
                            @click="$refs.dialog.save(time)"
                        >
                            OK
                        </v-btn>
                    </v-time-picker>
                </v-dialog>

            </div>
        </div>

        <div class="row">
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

                    :targetName         = "attack.targetName"
                    :targetCityLabel    = "attack.targetCityLabel"
                    :targetCityCoordinates = "attack.targetCityCoordinates"
                    :senderName         = "attack.senderName"
                    :senderCityLabel    = "attack.senderCityLabel"
                    :senderCityCoordinates = "attack.senderCityCoordinates"

                    :spottedDatetime      = "attack.spottedDatetime"
                    :arrivalDatetime    = "attack.arrivalDatetime"
                    :troopTimes         = "attack.troopTimes"

                    :riskLimit          = "riskLimit"

                    @button:remove = "removeAttackDetail(attack.id)"
                />

                <pre v-if="debug">{{filteredTroopMovements}}</pre>
            </div>
        </div>

    </div>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

import {
    troopsFinalMap,
} from '@/interfaces';

import { secondsToTime } from '@/assets/js/temporary';

import attackCard from '@/components/cards/attackDetailCard.vue';


interface vueRefsMap {
	$refs: {
		casermaRaw :HTMLPictureElement,
	}
}

export default (Vue as VueConstructor<Vue & vueRefsMap>).extend({
	name: 'testpage',
    components: {
        attackCard,
    },
	data() {
		return {
            //elements
            modalInputSpottedTime: false as boolean,
            //options
            targetName: '' as string,
            targetCityLabel: '' as string,
            targetCityCoordinates: ['0', '0'] as string[],
            gapMinutes: 60 as number,
            inputSpottedTime: null as string | null,
            //filters
            riskLimit: 5 as number,
            categories: ['inAttack'] as string[],
		}
	},
	computed: {
        ...mapState({
            debug: (state :any) => state.debug,
            troopDetails: (state :any) => state.troopDetails,
        }),
        ...mapGetters([
            'getStringDateFromDate',
            'getTroopsFromLocal',
            'getBasicDataFromLocal',
        ]),

        loadingPromise() :Promise<any> {
            return Promise.all([
                this.getTroopsFromServer(),     //TODO mettere solo orari
            ]);
        },

        filteredTroopMovements() :troopsFinalMap[] {
            //@ts-ignore
            return Object.values(this.troopDetails).filter(({ category } :troopsFinalMap) => {
                return this.categories.includes(category);
    		});
        },

        inputSpottedDatetime() :Date | false {
            if(!this.inputSpottedTime)
                return false;
            return new Date(this.getStringDateFromDate() + " " + this.inputSpottedTime);
        }
	},
	methods: {
        ...mapMutations([
            'setLoading',
        ]),
        ...mapActions([
            'calculateTroopsFinal',
            'getTroopsFromServer',
        ]),

        casermaTranslate() :void {
            let tempArray :any = [];
            if(!this.$refs.casermaRaw)
                return;
            let nodeList :NodeListOf<Element> = this.$refs.casermaRaw.querySelectorAll(".troop_details"),
                i :number;
            // qualcosa è andato storto
            if(!nodeList || nodeList.length < 1)
                return;
            const basicData = this.getBasicDataFromLocal(this.$refs.casermaRaw);

            if(this.inputSpottedDatetime)
                basicData.spottedDatetime = this.inputSpottedDatetime;

            // tutti le varie <table> .troop_details in cui sono contenute tutte le info dell'attacco
            for(i = nodeList.length; i--; )
                tempArray.push(this.getTroopsFromLocal(nodeList[i]));
            tempArray = tempArray.filter(Boolean);

            for(i = tempArray.length; i--; )
                this.calculateTroopsFinal({
                    ...basicData,
                    ...tempArray[i],
                    gapTime: this.gapMinutes * 60,
                });
        },

        secondsToTimeAltered(seconds :number) :string {
            let temp = secondsToTime(seconds).split(":");
            temp.pop();
            return temp.join(":");
        },

        removeAttackDetail(id :string){
            console.log("REMOVE", id);
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
            "spottedDatetime": new Date("2021-07-17T17:34:15.000Z"),
            "targetName": "zxc",
            "targetCityLabel": "01 Lions",
            "targetCityCoordinates": [
              "45",
              "-29"
            ],
            "gapTime": 600,
            "id": "g4f969f2-09a5-43dd-97d9-1b04b93ea665",
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
              "spottedDatetime": new Date("2021-07-18T23:27:45.000Z"),
              "targetName": "zxc",
              "targetCityLabel": "01 Lions",
              "targetCityCoordinates": [
                "45",
                "-29"
              ],
              "gapTime": 600,
              "id": "gb91e346-1c99-4628-b6e1-67d9f25f836b",
              "arrivalDatetime": "2021-07-19T06:22:18.000Z",
            }
        );
        /**/
    },
});
</script>

<style lang="scss">
    .caserma-insert-data{
        height:100px;
        background:black;
        overflow:hidden;
        & > *{
            display: none;
        }
    }
</style>
