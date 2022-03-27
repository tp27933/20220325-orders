<template>
  <section class="q-pa-md fit row items-center justify-center">
    <q-form style="max-width: 500px" @submit="onSubmit" @reset="onReset" class="q-gutter-md col">
      <q-input filled v-model="username" label="Username" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type your account']" />

      <q-input filled v-model="password" label="Passowrd" lazy-rules :rules="[
          val => val !== null && val !== '' || 'Please type your password'
        ]" />

      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </section>
</template>

<script>
import { useQuasar } from 'quasar'
import { RequestLogin } from '../api'
import { useRouter } from 'vue-router'
import { ref, inject } from 'vue'

export default {
  name: 'Login',
  setup() {
    const showLoading = inject('showLoading')
    const hideLoading = inject('hideLoading')

    const $q = useQuasar()
    const router = useRouter()
    const username = ref('wota')
    const password = ref('wota123')
    const onSubmit = () => {
      showLoading()
      RequestLogin({
        username: username.value,
        password: password.value
      }).then(res => {
        console.log(res)
        if (res.status !== 200) {
          $q.notify({
            position: 'top',
            color: 'red-5',
            textColor: 'white',
            icon: 'error',
            message: res.error
          })
          return
        }
        setToken(res.data.token)
        hideLoading()
        router.push({ name: 'Index' })
      }).catch(err => {
        hideLoading()
        console.log(err)
      })
    }
    const onReset = () => {
      username.value = null
      password.value = null
    }
    const setToken = (token) => {
      $q.localStorage.set('accessToken', token)
    }
    return {
      username,
      password,
      onSubmit,
      onReset
    }
  }
}
</script>
