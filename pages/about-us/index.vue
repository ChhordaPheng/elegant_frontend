<script setup lang="ts">
const coreValues = [
  {
    title: "Integrity",
    desc: "We hold ourselves to the highest standards of transparency, ethics, and responsibility.",
  },
  {
    title: "Creativity",
    desc: "We push the boundaries of design with bold ideas and timeless elegance.",
  },
  {
    title: "Sustainability",
    desc: "Our commitment to sustainability drives every decision we make—from fabrics to packaging.",
  },
];

const team = [
  { name: "Sophie Lee", role: "Creative Director", img: "/images/da.jpg" },
  { name: "David Tran", role: "Marketing Head", img: "/images/da.jpg" },
  { name: "Amara Chen", role: "Lead Designer", img: "/images/da.jpg" },
];
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <div class="overlay" />
      <div class="hero-content">
        <h1 class="text-5xl font-bold mb-4 animate-fade">Elegant Chic</h1>
        <p class="text-lg animate-fade delay-1">
          Where timeless fashion meets modern vision.
        </p>
      </div>
    </section>

    <!-- Brand Introduction -->
    <v-container class="py-20">
      <v-row class="fade-in delay-1">
        <v-col cols="12" md="6">
          <h2 class="text-3xl font-bold mb-4">About Our Brand</h2>
          <p class="text-gray-700 text-lg leading-relaxed">
            Founded with a passion for elevated simplicity, Elegant Chic is more
            than a fashion label — it's a lifestyle philosophy. Our collections
            blend classic silhouettes with contemporary detail, delivering
            confidence and refinement to the everyday wardrobe. We believe that
            elegance is an attitude, and style is its expression.
          </p>
        </v-col>
        <v-col cols="12" md="6">
          <v-img
            src="https://i.pinimg.com/736x/ac/c9/d0/acc9d098125812c4515c16b885d67138.jpg"
            height="350"
            class="rounded-xl shadow-lg"
            cover
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Philosophy Section -->
    <v-container class="py-20 fade-in delay-2">
      <v-row align="center">
        <v-col cols="12" md="6">
          <h2 class="text-3xl font-bold mb-4">Our Philosophy</h2>
          <p class="text-gray-700 text-lg leading-relaxed">
            We design with purpose and passion. At the core of every collection
            is our belief that fashion should not only empower—but also endure.
            We focus on ethical sourcing, high-quality materials, and versatile
            designs to ensure that each piece can be cherished for years to
            come.
          </p>
        </v-col>
        <v-col cols="12" md="6">
          <v-img
            src="https://source.unsplash.com/800x600/?philosophy,fashion"
            height="350"
            class="rounded-xl shadow-md"
            cover
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Craftsmanship Section -->
    <v-container class="py-20 bg-surface fade-in delay-3">
      <v-row>
        <v-col cols="12" md="6">
          <v-img
            src="https://source.unsplash.com/800x600/?craft,fashion"
            height="350"
            class="rounded-xl shadow-md"
            cover
          />
        </v-col>
        <v-col cols="12" md="6">
          <h2 class="text-3xl font-bold mb-4">Craftsmanship</h2>
          <p class="text-gray-700 text-lg leading-relaxed">
            Every stitch, every seam, and every detail is an expression of care.
            Our artisans and designers collaborate to ensure exceptional
            quality—from first sketch to final finish. We champion slow fashion:
            fewer pieces, higher quality, and greater meaning.
          </p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Core Values -->
    <v-container class="py-20 fade-in delay-4">
      <h2 class="text-center text-3xl font-semibold mb-10">Our Core Values</h2>
      <v-row justify="center" class="gap-6">
        <v-col
          v-for="(val, i) in coreValues"
          :key="i"
          cols="12"
          sm="6"
          md="4"
          class="fade-in"
          :class="`delay-${i + 5}`"
        >
          <v-card class="modern-card pa-8 text-center elevation-1">
            <h3 class="card-title mb-3">{{ val.title }}</h3>
            <p class="card-desc">{{ val.desc }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Team Section -->
    <v-container class="py-20 fade-in delay-5">
      <h2 class="text-center text-3xl font-bold mb-10">Meet the Team</h2>
      <v-row justify="center">
        <v-col
          v-for="(person, index) in team"
          :key="index"
          cols="12"
          sm="4"
          class="text-center fade-in"
          :class="`delay-${index + 6}`"
        >
          <v-card
            class="pa-6 rounded-xl elevation-2 hover:scale-[1.03] transition-transform"
          >
            <v-avatar size="100" class="mb-4 mx-auto">
              <v-img :src="person.img" />
            </v-avatar>
            <h3 class="text-lg font-semibold">{{ person.name }}</h3>
            <p class="text-gray-600">{{ person.role }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.hero {
  height: 300px;
  background-image: url("/banners/about_us.png");
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}
.hero-content {
  z-index: 2;
  text-align: center;
  color: white;
}
.bg-surface {
  background-color: #f9f9f9;
}
.glass {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
}

/* Animations */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade {
  opacity: 0;
  animation: fadeUp 1s ease-out forwards;
}
.fade-in {
  opacity: 0;
  animation: fadeUp 1s ease-out forwards;
}
.delay-1 {
  animation-delay: 0.3s;
}
.delay-2 {
  animation-delay: 0.6s;
}
.delay-3 {
  animation-delay: 0.9s;
}
.delay-4 {
  animation-delay: 1.2s;
}
.delay-5 {
  animation-delay: 1.5s;
}
.delay-6 {
  animation-delay: 1.8s;
}
.delay-7 {
  animation-delay: 2.1s;
}
.delay-8 {
  animation-delay: 2.4s;
}

/* Text Color */
.text-gray-600 {
  color: #6b7280;
}
.text-gray-700 {
  color: #374151;
}
.modern-card {
  background: linear-gradient(135deg, #fefefe 0%, #e0f2fe 100%);
  border-radius: 16px;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 8px 12px rgba(0, 120, 255, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}
.modern-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow:
    0 6px 15px rgba(0, 0, 0, 0.15),
    0 12px 20px rgba(0, 120, 255, 0.3);
}
.card-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #0f172a; /* Very dark blue/gray */
  position: relative;
  display: inline-block;
  margin: 0 auto;
  padding-bottom: 8px;
}
.card-title::after {
  content: '';
  display: block;
  width: 50px;
  height: 3px;
  background: #3b82f6; /* Blue accent */
  margin: 8px auto 0;
  border-radius: 2px;
}
.card-desc {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: #475569; /* Medium gray */
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
}
</style>
