import Vue, { PropOptions } from "vue";

export default Vue.extend({
	props: {
		show: {
			type: Boolean,
			default: () => {
				return false;
			}
		} as PropOptions<boolean>,
	},
	watch:{
		show(opened :boolean){
			if(opened)
				this.emitOpened();
		},
	},
	computed: {
		trueShow: {
			get() :boolean {
				return this.show;
			},
			set(val :string) {
				this.$emit("input", val);
			}
		}
	},
	methods: {
		emitClose(){
			this.trueShow = false;
		},
		emitOpened(){},
	}
});
