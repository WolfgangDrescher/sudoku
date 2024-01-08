<script setup>
const easy = '.1...8...3.472169...6....1....9.253..421.378..358.6....9....1...213874.9...5...2.';
const hard = '..1.36...3.......6.6......4.2.6.3..1..42189..5..7.9.2.4......5.9.......2...98.3..';
const expert = '.6...7....1....7..4...65..9.......4.3.49.....5...72......1.3.9.........629....5..';
const alverde = '.1.7.3.5...7...8...8.....6.7...5...6...4.9...9...6...2.3.....8...5...6...4.1.5.9.';
const alverde2 = '.56...48.1..3.8..59...7...2.2.....5...9.1.8...8.....3.7...8...48..5.2..3.15...96.';
const nakedPair = '..643......267.8...3.21..69543..6...219.47..66871.3.4.97.3.2...361.84.7..257.1...';
const lockedCandidate = '521349678..8167352673.....418.4...3.2.47..8....6....45..9.83..136..1458.81..7.4.3';
const extreme = '..4..6..2.1..9..3.9..7..8..1..4..5...3..2..1...9..5..8..7..8..4.5..4..6.3..5..9..';
const hint17 = '.29...4.....5..1...4...........42...6......7.5........7..3....5.1..9...........6.';
const hint17_1 = '7...2...4...5...6........31...78.5...31................6.3.1...2.....9...........';
const diabolical = '8...6...9.2..4..8....1.9.....1...4..46......5..5.9.6....95.68...7..2..9.2...1...7'
const sudoku = ref(new Sudoku(expert));

const highlightNumber = ref(null);
const showOptions = ref(false);

function solveNext() {
    const result = sudoku.value.solveNext();
    console.log(result);
}

function solve() {
    sudoku.value.solve();
}

function resetOptions() {
    sudoku.value.ressetOptions();
}

function validate() {
    sudoku.value.throwError();
}
</script>

<template>
    <div class="flex gap-4">
        <div class="grid grid-cols-9 md:w-1/2">
          <template v-for="row in 9">
              <SudokuCell
                v-for="col in 9"
                :cell="sudoku.getCell(row, col)"
                :highlight-number="highlightNumber"
                :row-has-number="sudoku.rowHasNumber(row, highlightNumber)"
                :col-has-number="sudoku.colHasNumber(col, highlightNumber)"
                :block-has-number="sudoku.blockHasNumber(Sudoku.getBlockNumber(row, col), highlightNumber)"
                :show-options="showOptions"
                :value="sudoku.getCell(row, col).input" @update:modelValue="sudoku.getCell(row, col).input = $event; sudoku.resetCellOptions(sudoku.getCell(row, col)); sudoku.calcOptions();"
            />
          </template>
        </div>
        <div>
            <div>
                Highlight Number: <input v-model.number="highlightNumber" />
            </div>
            <div>
                Show Options: <input type="checkbox" v-model="showOptions">
            </div>
            <div>
                <button @click="solveNext">Solve next</button>
            </div>
            <div>
                <button @click="resetOptions">Reset options</button>
            </div>
            <div>
                <button @click="validate">Validate</button>
            </div>
            <div>
                <button @click="solve">Solve</button>
            </div>
            <div>
                <div class="w-4 h-4 rounded-full" :class="sudoku.isValid ? 'bg-green-500' : 'bg-red-500'"></div>
            </div>
        </div>
    </div>
</template>
