<script setup lang="ts">
import { onMounted, ref } from "vue";

const coreValues = [
  {
    title: "Integrity",
    desc: "We uphold transparency, ethics, and responsibility in all we do.",
    icon: "🎯",
  },
  {
    title: "Creativity",
    desc: "We blend bold ideas with timeless design to express true individuality.",
    icon: "✨",
  },
  {
    title: "Sustainability",
    desc: "Every decision reflects our deep commitment to sustainable practices.",
    icon: "🌱",
  },
];

const team = [
  {
    name: "Sophie Lee",
    role: "Creative Director",
    img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "David Tran",
    role: "Marketing Head",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Amara Chen",
    role: "Lead Designer",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
];

const isLoaded = ref(false);

onMounted(() => {
  // Trigger animations after component mounts
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});
</script>

<template>
  <div class="modern-about">
    <!-- Hero Section -->
    <section class="hero">
      <div class="floating-element"></div>
      <div class="floating-element"></div>
      <div class="floating-element"></div>

      <div class="hero-content" :class="{ 'animate-in': isLoaded }">
        <h1 class="hero-title">Elegant Chic</h1>
        <p class="hero-subtitle">Timeless fashion, modern vision.</p>
      </div>

      <div class="scroll-indicator">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 16l-6-6h12l-6 6z" />
        </svg>
      </div>
    </section>

    <!-- About Section -->
    <section class="section">
      <div class="bg-decoration top-right"></div>
      <v-container>
        <div class="about-grid">
          <div class="about-content" :class="{ 'animate-in': isLoaded }">
            <h2 class="text-[35px] font-bold mb-5 shadow-sm">About Our Brand</h2>
            <p class="section-desc">
              Founded with a passion for elevated simplicity, Elegant Chic
              merges classic silhouettes with modern refinement. We believe
              elegance is an attitude—and style its voice. Our journey began
              with a simple vision: to create fashion that transcends trends and
              speaks to the soul of sophisticated individuals.
            </p>
          </div>
          <div class="about-image" :class="{ 'animate-in': isLoaded }">
            <v-img
              src="https://i.pinimg.com/736x/ac/c9/d0/acc9d098125812c4515c16b885d67138.jpg"
              height="500"
              cover
              class="rounded-image"
            />
          </div>
        </div>
      </v-container>
    </section>

    <!-- Philosophy Section -->
    <section class="section philosophy-section">
      <v-container>
        <div class="about-grid reverse">
          <div class="flex flex-col justify-center align-center">
            <div class="about-content" :class="{ 'animate-in': isLoaded }">
              <h2 class="">Our Philosophy</h2>
              <p class="section-desc">
                Each collection is crafted with purpose—from ethical sourcing to
                high-quality design. We aim to create pieces that empower and
                endure. Our philosophy centers on sustainable luxury, where
                every stitch tells a story of responsible craftsmanship.
              </p>
            </div>
          </div>
          <div class="about-image" :class="{ 'animate-in': isLoaded }">
            <v-img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              height="500"
              cover
              class="rounded-image"
            />
          </div>
        </div>
      </v-container>
    </section>

    <!-- Core Values -->
    <section class="section">
      <div class="bg-decoration bottom-left"></div>
      <v-container>
        <h2
          class="section-title text-center"
          :class="{ 'animate-in': isLoaded }"
        >
          Core Values
        </h2>
        <div class="values-grid">
          <v-card
            v-for="(value, index) in coreValues"
            :key="index"
            class="value-card"
            :class="{ 'animate-in': isLoaded }"
            :style="{ 'animation-delay': `${index * 0.2}s` }"
            elevation="0"
          >
            <div class="value-icon">{{ value.icon }}</div>
            <h3 class="value-title">{{ value.title }}</h3>
            <p class="value-desc">{{ value.desc }}</p>
          </v-card>
        </div>
      </v-container>
    </section>

    <!-- Team Section -->
    <!-- <section class="section team-section">
      <v-container>
        <h2
          class="section-title text-center"
          :class="{ 'animate-in': isLoaded }"
        >
          Meet the Team
        </h2>
        <div class="team-grid">
          <v-card
            v-for="(person, index) in team"
            :key="index"
            class="team-card"
            :class="{ 'animate-in': isLoaded }"
            :style="{ 'animation-delay': `${index * 0.15}s` }"
            elevation="0"
          >
            <v-avatar size="120" class="team-avatar">
              <v-img :src="person.img" />
            </v-avatar>
            <h3 class="team-name">{{ person.name }}</h3>
            <p class="team-role">{{ person.role }}</p>
          </v-card>
        </div>
      </v-container>
    </section> -->
  </div>
</template>

<style scoped>
.modern-about {
  font-family: "Inter", sans-serif;
  color: #0f172a;
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #158eb8 100%);
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  width: 200%;
  height: 200%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  animation: float 20s ease-in-out infinite;
}

.hero-content {
  text-align: center;
  color: white;
  z-index: 2;
  position: relative;
  opacity: 0;
  transform: translateY(50px);
  transition: all 1.2s ease-out;
}

.hero-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero-title {
  font-family: "Playfair Display", serif;
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 2px;
}

/* Floating Elements */
.floating-element {
  position: absolute;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  animation: floatUpDown 6s ease-in-out infinite;
}

.floating-element:nth-child(1) {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-element:nth-child(2) {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.floating-element:nth-child(3) {
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

/* Sections */
.section {
  padding: 8rem 0;
  position: relative;
}

.philosophy-section {
  background: white;
}

.team-section {
  background: white;
}

.section-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 600;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s ease-out;
}

/* Use deep selector to target dynamic classes */
::v-deep(.section-title.animate-in) {
  opacity: 1;
  transform: translateY(0);
}

.section-title.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.section-desc {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
}

.text-center {
  text-align: center;
}

/* About Grid */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
  margin-top: 4rem;
}

.about-grid.reverse {
  direction: rtl;
}

.about-grid.reverse > * {
  direction: ltr;
}

.about-content {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s ease-out 0.2s;
}

.about-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.about-image {
  opacity: 0;
  transform: scale(0.9);
  transition: all 1.2s ease-out 0.3s;
}

.about-image.animate-in {
  opacity: 1;
  transform: scale(1);
}

.rounded-image {
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.6s ease;
}

.rounded-image:hover {
  transform: scale(1.02);
}

/* Core Values */
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.value-card {
  background: white !important;
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s ease-out;
}

.value-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.value-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: left 0.6s ease;
}

.value-card:hover::before {
  left: 0;
}

.value-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.value-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #158eb8);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: white;
  font-size: 2rem;
  transition: transform 0.6s ease;
}

.value-card:hover .value-icon {
  transform: rotateY(180deg);
}

.value-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

.value-desc {
  color: #64748b;
  line-height: 1.6;
}

/* Team Section */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
}

.team-card {
  background: white !important;
  padding: 3rem 2rem;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s ease-out;
}

.team-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.team-card:hover {
  transform: translateY(-15px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
}

.team-avatar {
  margin: 0 auto 2rem;
  border: 4px solid #f1f5f9;
  transition: all 0.4s ease;
}

.team-card:hover .team-avatar {
  border-color: #667eea;
  transform: scale(1.1);
}

.team-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.team-role {
  color: #667eea;
  font-weight: 500;
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  animation: bounce 2s infinite;
}

/* Background Decorations */
.bg-decoration {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1),
    rgba(118, 75, 162, 0.1)
  );
  filter: blur(60px);
  z-index: -1;
}

.bg-decoration.top-right {
  top: -200px;
  right: -200px;
}

.bg-decoration.bottom-left {
  bottom: -200px;
  left: -200px;
}

/* Animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes floatUpDown {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-30px);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .section {
    padding: 4rem 0;
  }

  .hero-title {
    font-size: 3rem;
  }
}
</style>
