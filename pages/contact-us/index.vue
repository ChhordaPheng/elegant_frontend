<template>
  <v-container class="py-12">
    <v-row justify="center" align="center">
      <v-col cols="12" md="8" lg="6">
        <v-slide-y-transition>
          <v-card class="pa-8 rounded-2xl shadow-md" elevation="6">
            <v-card-title class="text-center text-h4 font-weight-bold mb-6">
              Contact Us
            </v-card-title>

            <v-form v-model="formValid" @submit.prevent="submitForm">
              <v-text-field
                v-model="form.name"
                label="Full Name"
                prepend-icon="mdi-account"
                :rules="[rules.required]"
                class="mb-4"
                variant="outlined"
                color="primary"
                rounded
              />

              <v-text-field
                v-model="form.email"
                label="Email Address"
                prepend-icon="mdi-email"
                :rules="[rules.required, rules.email]"
                class="mb-4"
                variant="outlined"
                color="primary"
                rounded
              />

              <v-text-field
                v-model="form.subject"
                label="Subject"
                prepend-icon="mdi-tag"
                :rules="[rules.required]"
                class="mb-4"
                variant="outlined"
                color="primary"
                rounded
              />

              <v-textarea
                v-model="form.message"
                label="Message"
                prepend-icon="mdi-message-text"
                :rules="[rules.required]"
                class="mb-6"
                auto-grow
                variant="outlined"
                color="primary"
                rounded
              />

              <v-btn
                :disabled="!formValid"
                type="submit"
                color="primary"
                size="large"
                block
                class="text-white text-capitalize"
              >
                Send Message
              </v-btn>
            </v-form>
          </v-card>
        </v-slide-y-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formValid = ref(false)

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
}

const submitForm = () => {
  // Reset form
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
}
</script>

<style scoped>
.shadow-md {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
</style>
