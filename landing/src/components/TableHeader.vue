<template>
  <div class="table-header-container pointer-events-none">
    <div class="header-main-section flex items-center justify-between gap-3 py-3">
      <div class="header-title-area flex items-center gap-3 pointer-events-auto flex-1">
        <div class="title-content">
          <div class="h-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 mb-3 w-12"></div>
          <h1 class="page-title text-xl font-semibold text-neutral-900">{{ title }}</h1>
          <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      
      <div class="header-search-section pointer-events-auto">
        <div class="search-container">
          <div class="clean-search bg-neutral-100 border border-neutral-200 rounded-lg h-10 px-3">
            <v-icon class="clean-search-icon" size="16">mdi-magnify</v-icon>
            <input
              type="text"
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              :placeholder="searchPlaceholder || 'Search...'"
              class="clean-search-input"
              autocomplete="off"
            />
            <button
              v-if="searchQuery"
              class="clear-btn"
              @click="$emit('update:searchQuery', '')"
              aria-label="Clear search"
            >
              &times;
            </button>
          </div>
        </div>
      </div>
      
      <div class="title-actions pointer-events-auto">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  searchQuery: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  icon: {
    type: [String, Array],
    default: null
  },
  iconName: {
    type: String,
    default: null
  },
  iconFa: {
    type: [String, Array],
    default: null
  },
  iconComponent: {
    type: String,
    default: null
  }
})

defineEmits(['update:searchQuery'])
</script>

<style scoped>
.table-header-container {
  background: #ffffff;
  border-radius: 0 !important;
  padding: 0.375rem 1.5rem !important;
  margin-top: 0 !important;
  margin-bottom: 0.25rem !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03) !important;
  border: none !important;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8) !important;
  max-width: none;
  width: 100%;
  height: auto !important;
  min-height: auto !important;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-main-section {
  width: 100%;
  height: 100%;
}

.header-title-area {
  flex: 1;
  height: 100%;
  position: relative;
  z-index: 1;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 10;
}

.title-icon-wrapper {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  position: relative;
  overflow: visible;
}

.title-icon {
  color: #ffffff !important;
  font-size: 18px !important;
  width: 18px !important;
  height: 18px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  flex-shrink: 0;
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  justify-content: center;
}

.page-title {
  margin: 0 !important;
  padding: 0 !important;
  letter-spacing: -0.01em !important;
  line-height: 1.25 !important;
}

.page-subtitle {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 0.75rem !important;
  color: #6b7280 !important;
  font-weight: 400 !important;
  letter-spacing: 0 !important;
  line-height: 1.2 !important;
}

.header-search-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 0 !important;
  height: 100%;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clean-search {
  position: relative;
  display: flex;
  align-items: center;
  width: 240px;
  min-width: 200px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.clean-search:focus-within {
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.clean-search-icon {
  font-size: 14px;
  color: #6b7280;
  margin-right: 6px;
}

.clean-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #374151;
  width: 100%;
}

.clean-search-input::placeholder {
  color: #6b7280;
  font-weight: 400;
  font-size: 14px;
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none !important;
  border: none !important;
  color: #374151 !important;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  font-weight: 300;
  opacity: 0.85;
  box-shadow: none !important;
  outline: none !important;
}

.clear-btn:hover {
  color: #111827 !important;
  opacity: 1;
}
</style>

