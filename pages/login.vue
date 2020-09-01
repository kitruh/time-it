<template>
<div>
  login screen
  <input type="text" v-model="username" >
  <input type="text"  v-model="password" >
  <button @click="loginUser">Submit</button>
  <button @click="loginWithGoogle">Login with google</button>
</div>
</template>

<script>

export default {
  name: 'login',
  data(){
    return{
      username: '',
      password: ''
    }
  },
  methods:{
    loginUser(){
      this.$auth.loginWith('local', {
        data: {
          username: this.username,
          password: this.password
        }
      })

    },
    loginWithGoogle(){
      this.$auth.loginWith('google')
    }
  }
};
</script>

<style scoped>

</style>