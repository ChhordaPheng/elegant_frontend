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
                v-model="form.phone"
                label="Phone Number"
                prepend-icon="mdi-phone"
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
                Send to Telegram
              </v-btn>
            </v-form>
          </v-card>
        </v-slide-y-transition>
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top"
      rounded="pill"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formValid = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
}

const submitForm = () => {
  // Create message for Telegram
  const telegramMessage = `🔔 New Contact Form Submission

👤 Name: ${form.value.name}
📧 Email: ${form.value.email}
📱 Phone: ${form.value.phone}
💬 Message: ${form.value.message}

📅 Sent: ${new Date().toLocaleString()}`

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(telegramMessage)
  
  // Direct Telegram Web URL with pre-filled message
  const telegramUrl = `https://web.telegram.org/a/#@Pheng_chhorda?text=${encodedMessage}`
  
  // Alternative method: Use tg:// protocol for better integration
  const telegramDeepLink = `https://t.me/Pheng_chhorda?text=${encodedMessage}`
  
  // Try to open with Telegram deep link first, fallback to web
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    // On mobile, try Telegram app first
    window.open(telegramDeepLink, '_blank')
    
    // Fallback to web version after short delay
    setTimeout(() => {
      window.open(telegramUrl, '_blank')
    }, 1000)
  } else {
    // On desktop, open web version directly
    window.open(telegramUrl, '_blank')
  }

  // Reset form after successful submission
  form.value = {
    name: '',
    email: '',
    phone: '',
    message: '',
  }
  
  // Show success snackbar
  snackbar.value = {
    show: true,
    message: 'Message prepared! Telegram will open with your message ready to send.',
    color: 'success',
    icon: 'mdi-telegram'
  }
}
</script>

<style scoped>
.shadow-md {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
</style>