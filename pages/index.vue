<template>
    <div>
        <div class="row">
            <div class="col-12 col-lg-6 offset-lg-3 row">
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
                <div class="col-12 col-md-8">
                    <v-slider
                        v-model="missingMinutes"
                        label="AFK"
                        thumb-color="red"
                        thumb-label="always"
                        step="10"
                        min="0"
                        max="720"
                    >
                        <template v-slot:thumb-label="{ value }">
                          {{ secondsToTimeAltered(value*60) }}
                        </template>
                    </v-slider>
                </div>
                <div class="col-12 col-md-4">
                    <v-slider
                        v-model="riskLimit"
                        label="rischio"
                        thumb-color="red"
                        thumb-label="always"
                        min="0"
                        max="5"
                    />
                </div>
            </div>
            <div class="col-12">
                <div ref="casermaRaw"
                    class="caserma-insert-data"
                    contenteditable
                    @input="casermaTranslate"
                />
                <v-btn @click="casermaTranslate">DO THINGS</v-btn>
            </div>
            <div class="col-12">

                <attack-card
                    v-for = "attack in normalAttacks"
                    :key                =  "'attack-details-'+attack.id"
                    :id                 = "attack.id"
                    :category           = "attack.category"

                    :targetName         = "attack.targetName"
                    :targetCityLabel    = "attack.targetCityLabel"
                    :targetCityCoordinates = "attack.targetCityCoordinates"
                    :senderName         = "attack.senderName"
                    :senderCityLabel    = "attack.senderCityLabel"
                    :senderCityCoordinates = "attack.senderCityCoordinates"

                    :startDatetime      = "attack.startDatetime"
                    :arrivalDatetime    = "attack.arrivalDatetime"
                    :troopTimes         = "attack.troopTimes"

                    :riskLimit          = "riskLimit"

                    @button:remove = "removeAttackDetail(attack.id)"
                />

                <pre v-if="debug">{{normalAttacks}}</pre>

            </div>
        </div>
    </div>
</template>

<script lang="ts">
/*
DEMO:

nessuna iscrizione, utenti anonimi possono riempire
link speciale con chiave incorporata per gli admin che vedono tutto
*/

import Vue, { VueConstructor } from 'vue';
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

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
            targetName: 'zxc',
            targetCityLabel: '01 Lions',
            targetCityCoordinates: ['45', '-29'],
            missingMinutes: 10,
            riskLimit: 5,
		}
	},
	computed: {
        ...mapState({
            debug: (state :any) => state.debug,
        }),
        ...mapGetters([
           'normalAttacks',
           'getTroopsFromLocal',
           'getSecureSpottedDatetime',
        ]),

        loadingPromise() :Promise<any> {
            return Promise.all([
                this.getTroopsFromServer(),     //TODO mettere solo orari
            ]);
        },
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

            // tutti le varie <table> .troop_details in cui sono contenute tutte le info dell'attacco
            for(i = nodeList.length; i--; )
                tempArray.push(this.getTroopsFromLocal(nodeList[i]));
            tempArray = tempArray.filter(Boolean);

            for(i = tempArray.length; i--; )
                this.calculateTroopsFinal({
                    ...tempArray[i],
                    startDatetime: this.getSecureSpottedDatetime(this.$refs.casermaRaw.querySelector('#servertime .timer')),
                    targetName: this.targetName,
                    targetCityLabel: this.targetCityLabel,
                    targetCityCoordinates: this.targetCityCoordinates,
                    missingTime: this.missingMinutes * 60,
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
            "startDatetime": new Date("2021-07-17T17:34:15.000Z"),
            "targetName": "zxc",
            "targetCityLabel": "01 Lions",
            "targetCityCoordinates": [
              "45",
              "-29"
            ],
            "missingTime": 600,
            "id": "g4f969f2-09a5-43dd-97d9-1b04b93ea665",
            }
        );
    },
});
</script>

<style lang="scss">
    .caserma-insert-data{
        height:2em;
        background:black;
        overflow:hidden;
        & > *{
            display: none;
        }
    }
</style>
