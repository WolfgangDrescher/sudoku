<script setup>
const easy = '.1...8...3.472169...6....1....9.253..421.378..358.6....9....1...213874.9...5...2.';
const hard = '..1.36...3.......6.6......4.2.6.3..1..42189..5..7.9.2.4......5.9.......2...98.3..';
const expert = '.6...7....1....7..4...65..9.......4.3.49.....5...72......1.3.9.........629....5..';
const alverde = '.1.7.3.5...7...8...8.....6.7...5...6...4.9...9...6...2.3.....8...5...6...4.1.5.9.';
const nakedPair = '..643......267.8...3.21..69543..6...219.47..66871.3.4.97.3.2...361.84.7..257.1...';
const lockedCandidate = '521349678..8167352673.....418.4...3.2.47..8....6....45..9.83..136..1458.81..7.4.3';
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
</script>

<template>
    <div class="flex gap-4">
        <div class="grid grid-cols-9 md:w-1/2">
          <template v-for="row in 9">
              <SudokuCell
                v-for="col in 9"
                :cell="sudoku.getCell(row, col)"
                :highlightNumber="highlightNumber"
                :row-has-number="sudoku.rowHasNumber(row, highlightNumber)"
                :col-has-number="sudoku.colHasNumber(col, highlightNumber)"
                :block-has-number="sudoku.blockHasNumber(Sudoku.getBlockNumber(row, col), highlightNumber)"
                :show-options="showOptions"
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
                <button @click="solve">Solve</button>
            </div>
        </div>
    </div>
</template>
