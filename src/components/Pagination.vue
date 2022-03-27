<template>
  <div class="flex">
    <q-select borderless v-model="size"
      :options="sizeArry"
      @update:model-value="onPageSizeChange">
      <template v-slot:prepend>
        <span class="text-subtitle2">每頁面單數</span>
      </template>
    </q-select>
    <q-pagination @click="onPageChange"
      v-model="page" :max="maxSize" size="sm"
      :max-pages="5" direction-links
      boundary-links />
  </div>

</template>

<script>
import { computed, defineComponent, onMounted, ref, watch } from "vue";

export default defineComponent({
  name: "EssentialLink",
  props: {
    totalSize: {
      type: Number || String,
      default: () => 3
    },
    currentPage: {
      type: Number || String,
      default: () => 1
    },
    currentSize: {
      type: Number || String,
      default: () => 1
    },
    sizeArry: {
      type: Array,
      default: () => [10, 20, 30],
      required: true,
    }
  },
  emits: ["onPageChange", "onPageSizeChange"],
  setup (props, { emit }) {
    const size = ref(0)
    const page = ref(1)
    onMounted(() => {
      size.value = props.currentSize
    })
    const onPageChange = () => {
      emit('onPageChange', page.value)
    }
    const onPageSizeChange = () => {
      emit('onPageSizeChange', size.value)
    }
    watch(() => props.currentSize, (val) => {
      size.value = val
    });
    watch(() => props.currentPage, (val) => {
      page.value = val
    });
    const maxSize = computed(() => {
      const { currentSize, totalSize } = props
      if (totalSize % currentSize !== 0) {
        return parseInt(totalSize / currentSize) + 1
      }
      return totalSize / currentSize
    })
    return {
      maxSize,
      page,
      size,
      onPageChange,
      onPageSizeChange
    }
  }
});
</script>
