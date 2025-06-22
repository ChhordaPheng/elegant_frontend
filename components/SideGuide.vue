<script setup lang="ts">
// Reactive data
const highlightedSize = ref<string | null>(null);

// Static data
const headers = [
  { title: "Height (CM)", value: "height", width: "120px", sortable: false },
  { title: "55-57", value: "weight1", width: "80px", sortable: false },
  { title: "58-60", value: "weight2", width: "80px", sortable: false },
  { title: "61-63", value: "weight3", width: "80px", sortable: false },
  { title: "64-66", value: "weight4", width: "80px", sortable: false },
  { title: "67-69", value: "weight5", width: "80px", sortable: false },
  { title: "70-72", value: "weight6", width: "80px", sortable: false },
  { title: "73-75", value: "weight7", width: "80px", sortable: false },
  { title: "76-78", value: "weight8", width: "80px", sortable: false },
  { title: "79-81", value: "weight9", width: "80px", sortable: false },
  { title: "82-84", value: "weight10", width: "80px", sortable: false },
  { title: "85-87", value: "weight11", width: "80px", sortable: false },
  { title: "88-90", value: "weight12", width: "80px", sortable: false },
  { title: "91-93", value: "weight13", width: "80px", sortable: false },
  { title: "94-96", value: "weight14", width: "80px", sortable: false },
];

const sizeData = [
  {
    height: "190-192",
    sizes: [
      "",
      "",
      "",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
      "XXL",
      "XXL",
      "XXL",
      "XXL",
      "XXL",
      "",
      "",
    ],
    index: 0,
  },
  {
    height: "187-189",
    sizes: [
      "",
      "",
      "L",
      "L",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
      "XXL",
      "XXL",
      "XXL",
      "XXL",
      "",
    ],
    index: 1,
  },
  {
    height: "184-186",
    sizes: [
      "",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
      "XXL",
      "XXL",
      "XXL",
      "",
    ],
    index: 2,
  },
  {
    height: "181-183",
    sizes: [
      "M",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
      "XXL",
      "XXL",
      "",
    ],
    index: 3,
  },
  {
    height: "178-180",
    sizes: [
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
      "XXL",
      "",
    ],
    index: 4,
  },
  {
    height: "175-177",
    sizes: [
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
      "XXL",
    ],
    index: 5,
  },
  {
    height: "172-174",
    sizes: [
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
    ],
    index: 6,
  },
  {
    height: "169-171",
    sizes: [
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
    ],
    index: 7,
  },
  {
    height: "166-168",
    sizes: [
      "S",
      "S",
      "M",
      "M",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
      "XXL",
    ],
    index: 8,
  },
  {
    height: "163-165",
    sizes: [
      "S",
      "S",
      "S",
      "S",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XL",
      "XXL",
    ],
    index: 9,
  },
  {
    height: "160-162",
    sizes: [
      "S",
      "S",
      "S",
      "S",
      "S",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
    ],
    index: 10,
  },
  {
    height: "157-159",
    sizes: [
      "S",
      "S",
      "S",
      "S",
      "S",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "XL",
      "XXL",
    ],
    index: 11,
  },
  {
    height: "154-156",
    sizes: [
      "S",
      "S",
      "S",
      "S",
      "S",
      "M",
      "M",
      "M",
      "M",
      "L",
      "L",
      "L",
      "L",
      "L",
      "XL",
    ],
    index: 12,
  },
];

const weights = [
  "55-57",
  "58-60",
  "61-63",
  "64-66",
  "67-69",
  "70-72",
  "73-75",
  "76-78",
  "79-81",
  "82-84",
  "85-87",
  "88-90",
  "91-93",
  "94-96",
];

// Methods
const getSizeClass = (size: string) => {
  if (!size) return "";
  return `size-${size.toLowerCase()}`;
};

const getSizeColor = (size: string) => {
  const colors: Record<string, string> = {
    S: "success",
    M: "info",
    L: "warning",
    XL: "error",
    XXL: "purple",
    XXXL: "orange",
  };
  return colors[size] || "primary";
};

const highlightSize = (size: string) => {
  highlightedSize.value = size;
};

const clearHighlight = () => {
  highlightedSize.value = null;
};

// Lifecycle
onMounted(() => {
  const rows = document.querySelectorAll(".fade-in");
  rows.forEach((row, index) => {
    setTimeout(() => {
      row.setAttribute("style", "opacity: 1; transform: translateY(0)");
    }, index * 100);
  });
});
</script>

<template>
  <div class="size-guide-container">
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="size-table fade-in pulse-animation">
            <!-- Table Header -->
            <div class="table-header">
              <h1 class="text-h3 mb-3">
                <v-icon left size="large">mingcute:t-shirt-fill</v-icon>
                Clothing Size Guide
              </h1>
            </div>

            <!-- Fixed Header Size Data Table -->
            <v-data-table
              fixed-header
              height="400px"
              :headers="headers"
              :items="sizeData"
              hide-default-footer
              class="elevation-0"
              :items-per-page="-1"
            >
              <template v-slot:item="{ item }">
                <tr
                  class="fade-in"
                  :style="{ animationDelay: item.index * 0.1 + 's' }"
                >
                  <td class="height-cell">
                    <v-icon left small color="primary">
                      mdi-human-male-height
                    </v-icon>
                    {{ item.height }}
                  </td>
                  <td
                    v-for="(size, index) in item.sizes"
                    :key="index"
                    :class="getSizeClass(size)"
                    @mouseover="highlightSize(size)"
                    @mouseleave="clearHighlight()"
                  >
                    <v-chip
                      v-if="size"
                      small
                      :color="getSizeColor(size)"
                      text-color="white"
                      class="font-weight-bold"
                    >
                      {{ size }}
                    </v-chip>
                  </td>
                </tr>
              </template>
            </v-data-table>

            <!-- Bottom Weight Legend -->
            <div class="pa-4">
              <v-row>
                <v-col cols="12">
                  <div class="text-center">
                    <v-chip
                      v-for="weight in weights"
                      :key="weight"
                      class="weight-cell ma-1"
                      small
                      outlined
                      color="primary"
                    >
                      <v-icon left small>mdi-weight</v-icon>
                      {{ weight }} kg
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style>
.v-data-table {
  overflow-y: auto;
  border-radius: 12px;
}
.size-table {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.size-table:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
}

.table-header {
  background: linear-gradient(45deg, #5175d8, #1a067e);
  color: white;
  padding: 30px;
  text-align: center;
}

.v-data-table {
  background: transparent !important;
}

.v-data-table-header__content {
  font-weight: 700;
  color: #2c3e50;
  font-size: 14px;
}

.v-data-table__td {
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.v-data-table__td:hover {
  background: linear-gradient(45deg, #667eea20, #764ba220) !important;
  transform: scale(1.05);
  border-radius: 8px;
  color: #2c3e50;
}

.height-cell {
  background: linear-gradient(135deg, #667eea15, #764ba215);
  font-weight: 700;
  color: #2c3e50;
}

.weight-cell {
  background: linear-gradient(135deg, #764ba215, #667eea15);
  font-weight: 700;
  color: #2c3e50;
}

.size-s {
  color: #27ae60;
  font-weight: 700;
}
.size-m {
  color: #3498db;
  font-weight: 700;
}
.size-l {
  color: #e67e22;
  font-weight: 700;
}
.size-xl {
  color: #cf1601;
  font-weight: 700;
}
.size-xxl {
  color: #a837d5;
  font-weight: 700;
}
.size-xxxl {
  color: #f39c12;
  font-weight: 700;
}

.fade-in {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

.info-chip {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  margin: 5px;
}

.measurement-info {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  backdrop-filter: blur(10px);
}
</style>
