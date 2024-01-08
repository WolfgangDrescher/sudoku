<script setup>
const value = defineModel();
const props = defineProps({
    cell: Object,
    showOptions: Boolean,
    rowHasNumber: Boolean,
    colHasNumber: Boolean,
    blockHasNumber: Boolean,
    highlightNumber: {
        type: [Number, String],
        required: false,
    },
    highlightNakedSingle: Boolean,
});

const displayHighlightNumber = computed(() => {
    return typeof props.highlightNumber === 'number' && props.highlightNumber && !Number.isNaN(props.highlightNumber);
});
</script>

<template>
    <div class="aspect-w-1 aspect-h-1">
        <div class="w-full h-full border flex items-center justify-center" :class="{
            'border-b-4 border-b-gray-300': cell.row % 3 === 0 && cell.row < 9,
            'border-r-4 border-r-gray-300': cell.col % 3 === 0 && cell.col < 9,
        }">
            <div v-if="cell.given || cell.resolved" class="text-6xl" :class="{
                'font-bold': cell.value === cell.given,
                'text-blue-500': cell.value === cell.resolved,
            }">
                {{ cell.value }}
            </div>
            <input v-else v-model.number="value" class="absolute w-full h-full z-10 bg-transparent text-center text-6xl text-purple-500" />
            <div class="absolute w-full h-full">
                <template v-if="displayHighlightNumber">
                    <div v-if="blockHasNumber || rowHasNumber || colHasNumber || cell.value !== null" class="w-full h-full bg-red-500/10 absolute left-0 top-0"></div>
                    <div v-if="rowHasNumber && highlightNumber !== cell.value" class="w-full bg-red-500/30 h-1 absolute top-1/2 -translate-y-1/2"></div>
                    <div v-if="colHasNumber && highlightNumber !== cell.value" class="h-full bg-red-500/30 w-1 absolute left-1/2 -translate-x-1/2"></div>
                    <div v-if="highlightNumber === cell.value" class="w-3/4 h-3/4 border-4 border-red-500/30 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </template>
                <div v-if="highlightNakedSingle" class="w-full h-full bg-green-500/10 absolute left-0 top-0"></div>
                <div v-if="showOptions && !cell.value" class="grid grid-cols-3">
                    <div v-for="n in 9" class="aspect-w-1 aspect-h-1">
                        <div class="w-full h-full flex items-center justify-center" :class="{
                            'text-red-500': !cell.options.includes(n),
                            'text-green-500': cell.options.includes(n),
                        }">
                            {{ n }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
