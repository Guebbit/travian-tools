<template>
    <v-app dark>
        <v-navigation-drawer
            v-model="leftDrawer"
            mini-variant
            fixed
            app
        >
            <v-list>
                <v-list-item
                    v-for="(item, i) in items"
                    :key="'menu-item-'+i"
                    :to="item.to"
                    router
                    exact
                >
                    <v-list-item-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title v-text="item.title" />
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <v-container>
                <Nuxt />
            </v-container>
        </v-main>

        <v-app-bar
            fixed
            app
        >
            <v-app-bar-nav-icon @click.stop="leftDrawer = !leftDrawer" />
            <v-toolbar-title>Travian</v-toolbar-title>
            <v-spacer />
        </v-app-bar>

        <v-footer
            app
        >
            <span>&copy; {{ new Date().getFullYear() }}</span>
        </v-footer>
    </v-app>
</template>

<script>
export default {
    data () {
        return {
            leftDrawer: false,
            items: [
                {
                    icon: 'mdi-sword-cross',
                    title: 'Home',
                    to: '/'
                },
            ],
        }
    }
}
</script>
