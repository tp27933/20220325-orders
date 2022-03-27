<template>
  <router-view />
</template>
<script>

import { defineComponent, provide } from "vue";
import { useQuasar, QSpinnerGears } from 'quasar'

export default defineComponent({
  name: "App",
  setup() {
    const $q = useQuasar()
    const showLoading = (message) => {
      $q.loading.show({
        spinner: QSpinnerGears,
        spinnerColor: 'primary',
        messageColor: 'black',
        backgroundColor: 'white',
        message: message || ''
      })
    }
    const hideLoading = () => {
      $q.loading.hide()
    }
    provide('showLoading', showLoading)
    provide('hideLoading', hideLoading)
  }
});
</script>
<style>
*,
body {
  box-sizing: border-box;
}
body {
  height: 100vh;
  background: #ecf5f2;
}
#q-app {
  height: 100%;
}
</style>
