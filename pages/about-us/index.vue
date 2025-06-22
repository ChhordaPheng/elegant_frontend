<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <v-row class="hero-section" no-gutters>
      <v-col cols="12">
        <v-container class="py-16">
          <v-row justify="center" align="center" class="text-center">
            <v-col cols="12" md="8">
              <h1 class="display-2 font-weight-bold mb-4 text-white">
                About Our Company
              </h1>
              <p class="headline font-weight-light text-white mb-8">
                Innovative solutions for a better tomorrow
              </p>
              <v-btn
                color="primary"
                size="large"
                variant="elevated"
                @click="scrollToSection('mission')"
              >
                Learn More
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>

    <!-- Mission Section -->
    <v-container id="mission" class="py-16">
      <v-row justify="center">
        <v-col cols="12" md="10">
          <div class="text-center mb-12">
            <h2 class="display-1 font-weight-bold mb-4">Our Mission</h2>
            <p class="title font-weight-light text-grey-darken-1">
              Empowering businesses through cutting-edge technology and exceptional service
            </p>
          </div>
          
          <v-row>
            <v-col cols="12" md="4" v-for="value in companyValues" :key="value.title">
              <v-card class="h-100" elevation="2" hover>
                <v-card-text class="text-center pa-8">
                  <v-icon
                    :icon="value.icon"
                    size="64"
                    :color="value.color"
                    class="mb-4"
                  ></v-icon>
                  <h3 class="text-h5 font-weight-bold mb-3">{{ value.title }}</h3>
                  <p class="text-body-1">{{ value.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Team Section -->
    <v-container class="py-16 bg-grey-lighten-5">
      <v-row justify="center">
        <v-col cols="12" md="10">
          <div class="text-center mb-12">
            <h2 class="display-1 font-weight-bold mb-4">Meet Our Team</h2>
            <p class="title font-weight-light text-grey-darken-1">
              The talented individuals behind our success
            </p>
          </div>
          
          <v-row>
            <v-col 
              cols="12" 
              sm="6" 
              md="4" 
              v-for="member in teamMembers" 
              :key="member.name"
              class="d-flex"
            >
              <v-card class="flex-grow-1" elevation="3" hover>
                <v-img
                  :src="member.image"
                  height="300"
                  cover
                  class="white--text align-end"
                  gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                >
                </v-img>
                <v-card-title class="text-h6 font-weight-bold">
                  {{ member.name }}
                </v-card-title>
                <v-card-subtitle class="text-primary font-weight-medium">
                  {{ member.position }}
                </v-card-subtitle>
                <v-card-text>
                  <p class="text-body-2 mb-3">{{ member.bio }}</p>
                  <div class="d-flex justify-center">
                    <v-btn
                      v-for="social in member.social"
                      :key="social.platform"
                      :icon="social.icon"
                      variant="text"
                      size="small"
                      :color="social.color"
                      @click="openLink(social.url)"
                    ></v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Company Stats -->
    <v-container class="py-16">
      <v-row justify="center">
        <v-col cols="12" md="10">
          <div class="text-center mb-12">
            <h2 class="display-1 font-weight-bold mb-4">Our Impact</h2>
          </div>
          
          <v-row>
            <v-col 
              cols="6" 
              md="3" 
              v-for="stat in companyStats" 
              :key="stat.label"
              class="text-center"
            >
              <div class="mb-4">
                <h3 class="display-2 font-weight-bold text-primary">
                  {{ stat.value }}
                </h3>
                <p class="text-h6 font-weight-medium text-grey-darken-1">
                  {{ stat.label }}
                </p>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Contact Section -->
    <v-container class="py-16 bg-primary">
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="display-1 font-weight-bold mb-4 text-white">
            Ready to Work Together?
          </h2>
          <p class="title font-weight-light text-white mb-8">
            Let's discuss how we can help your business grow
          </p>
          <v-btn
            color="white"
            variant="elevated"
            size="large"
            @click="contactUs"
          >
            Get In Touch
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Company values data
const companyValues = reactive([
  {
    title: 'Innovation',
    description: 'We push boundaries and embrace new technologies to deliver cutting-edge solutions.',
    icon: 'mdi-lightbulb-outline',
    color: 'primary'
  },
  {
    title: 'Quality',
    description: 'Excellence is not negotiable. We deliver high-quality products and services every time.',
    icon: 'mdi-star-outline',
    color: 'success'
  },
  {
    title: 'Partnership',
    description: 'We build lasting relationships with our clients based on trust and mutual success.',
    icon: 'mdi-handshake-outline',
    color: 'info'
  }
])

// Team members data
const teamMembers = reactive([
  {
    name: 'Sarah Johnson',
    position: 'CEO & Founder',
    bio: 'Visionary leader with 15+ years of experience in technology and business development.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    social: [
      { platform: 'LinkedIn', icon: 'mdi-linkedin', color: 'blue-darken-3', url: '#' },
      { platform: 'Twitter', icon: 'mdi-twitter', color: 'blue', url: '#' }
    ]
  },
  {
    name: 'Michael Chen',
    position: 'CTO',
    bio: 'Technical expert passionate about creating scalable solutions and leading development teams.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    social: [
      { platform: 'LinkedIn', icon: 'mdi-linkedin', color: 'blue-darken-3', url: '#' },
      { platform: 'GitHub', icon: 'mdi-github', color: 'grey-darken-3', url: '#' }
    ]
  },
  {
    name: 'Emily Rodriguez',
    position: 'Head of Design',
    bio: 'Creative designer focused on user experience and creating beautiful, functional interfaces.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    social: [
      { platform: 'LinkedIn', icon: 'mdi-linkedin', color: 'blue-darken-3', url: '#' },
      { platform: 'Dribbble', icon: 'mdi-dribbble', color: 'pink', url: '#' }
    ]
  }
])

// Company statistics
const companyStats = reactive([
  { value: '500+', label: 'Happy Clients' },
  { value: '1000+', label: 'Projects Completed' },
  { value: '50+', label: 'Team Members' },
  { value: '8', label: 'Years Experience' }
])

// Methods
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const openLink = (url) => {
  if (url !== '#') {
    window.open(url, '_blank')
  }
}

const contactUs = () => {
  // Implement contact functionality
  console.log('Contact us clicked')
  // You could navigate to a contact page or open a dialog
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 500px;
}

.v-container {
  max-width: 1200px;
}

.v-card {
  transition: transform 0.3s ease-in-out;
}

.v-card:hover {
  transform: translateY(-5px);
}

.bg-grey-lighten-5 {
  background-color: #fafafa !important;
}
</style>