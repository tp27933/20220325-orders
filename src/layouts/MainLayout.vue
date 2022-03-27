<template>
  <q-layout view="lHh Lpr lFf "
    class="full-height">
    <q-header reveal elevated>
      <q-toolbar>
        <q-toolbar-title>
          <strong>Orders</strong> Managmnet
        </q-toolbar-title>
        <q-btn flat round dense
          @click="onLoginSatusChange">
          {{ accountStatus }}
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container class="full-height">
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { useQuasar } from 'quasar'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import { ref, onUpdated, onMounted } from 'vue'

export default {
  setup () {
    const $q = useQuasar()
    const router = useRouter()
    const accountStatus = ref("")
    onMounted(() => {
      setButtonString()
    })
    onUpdated(() => {
      setButtonString()
    })
    const setButtonString = () => {
      accountStatus.value = router.currentRoute._rawValue.name ===
        'Login' ? '登入' : '登出'
    }
    const onLoginSatusChange = () => {
      const curretRoute = router.currentRoute._rawValue.name
      if (curretRoute !== 'Login') {
        $q.localStorage.remove('accessToken')
        router.push({ name: 'Login' })
      }
    }
    return {
      accountStatus,
      onLoginSatusChange
    }
  }
}
</script>
