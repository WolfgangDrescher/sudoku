export class Sudoku {
    constructor(str) {
        this.str = str;
        this.cells = [];
        str.split('').forEach((value, index) => {
            this.cells.push(new Cell(value, (index % 9) + 1, Math.floor(index / 9) + 1));
        });
        this.calcOptions();
    }

    calcOptions() {
        this.cells.forEach((cell) => {
            if (cell.value) {
                cell.options = [];
                this.getRow(cell.row).forEach(c => c.removeOption(cell.value));
                this.getCol(cell.col).forEach(c => c.removeOption(cell.value));
                this.getBlock(cell.block).forEach(c => c.removeOption(cell.value));
            }
        });
    }

    getCell(row, col) {
        return this.cells.find((cell) => cell.row === row && cell.col === col);
    }

    getRow(row) {
        return this.cells.filter((cell) => cell.row === row);
    }

    getCol(col) {
        return this.cells.filter((cell) => cell.col === col);
    }

    getBlock(block) {
        const cells = [];
        const startRow = ((Math.floor((block - 1) / 3)) * 3) + 1;
        const startCol = ((block - 1) % 3) * 3 + 1;
        for (let row = startRow; row < startRow + 3; row++) {
            for (let col = startCol; col < startCol + 3; col++) {
                cells.push(this.getCell(row, col));
            }
        }
        return cells;
    }

    getValues(cells) {
        return cells.map(c => c.value).filter(c => c);
    }

    rowHasNumber(row, num) {
        return this.getRow(row).map(c => c.value).includes(num);
    }

    colHasNumber(col, num) {
        return this.getCol(col).map(c => c.value).includes(num);
    }

    blockHasNumber(block, num) {
        return this.getBlock(block).map(c => c.value).includes(num);
    }

    getCellOptions(cell) {
        const rowValues = this.getValues(this.getRow(cell.row));
        const colValues = this.getValues(this.getCol(cell.col));
        const blockValues = this.getValues(this.getBlock(cell.block));
        const values = [...new Set([...rowValues, ...colValues, ...blockValues])]; // Set not needed here
        return Cell.createOptions().filter(v => !values.includes(v));
    }

    get isSolved() {
        return this.cells.every(cell => cell.value);
    }

    solveNext(exit = true) {

        /**
         * Methode des nackten Einers
         *
         * Hierbei wählt man zunächst ein Feld aus. Für dieses werden alle
         * Ziffern ausgeschlossen, die in derselben Einheit (Zeile, Spalte oder
         * Block) bereits stehen. Wenn nur noch eine Ziffer möglich bleibt, ist
         * sie die Lösung für dieses Feld. (Nur eine Ziffer verbleibt für die
         * betrachtete Position.)
         */
        {
            const cells = this.cells.filter(c => !c.value);
            for (let cell of cells) {
                const options = this.getCellOptions(cell)
                if (options.length === 1) {
                    cell.resolved = options[0];
                    this.calcOptions();
                    if (exit) return new NakedSingleSolution(cell, cell.resolved);
                }
            }
        }

        /**
         * Methode des versteckten Einers
         *
         * Bei dieser Methode betrachtet man eine Einheit (Zeile, Spalte oder
         * Block) und eine Ziffer, die noch nicht in dieser Einheit eingetragen
         * ist. Da jede Ziffer in einer Einheit genau einmal vorkommt, muss sie
         * in eines der freien Felder eingetragen werden. Falls es nur noch ein
         * freies Feld in dieser Einheit gibt, in die die Ziffer eingetragen
         * werden kann, ohne dass sie in einer anderen Einheit mehrfach
         * vorkommt, wird sie in dieses Feld eingetragen.
         */
        for (let select = 1; select <= 9; select++) {
            const unitCells = [
                this.getRow(select),
                this.getCol(select),
                this.getBlock(select),
            ];
            for (let cells of unitCells) {
                const values = this.getValues(cells);
                const options = Cell.createOptions().filter(v => !values.includes(v));
                const emptyCells = cells.filter(c => !c.value);
                for (let option of options) {
                    const cellsWithOption = emptyCells.filter(cell => this.getCellOptions(cell).includes(option))
                    if (cellsWithOption.length === 1) {
                        cellsWithOption[0].resolved = option;
                        this.calcOptions();
                        if (exit) return new HiddenSingleSolution(cellsWithOption[0], cellsWithOption[0].resolved);
                    }
                }
            }
        }

        // solve cells with a single option left
        this.cells.filter(c => !c.value).forEach(cell => {
            const options = this.getCellOptions(cell);
            if (options.length === 1) {
                cell.resolved = options[0];
                this.calcOptions();
            }
        });
    }

    solve(ts) {
        const start = ts || Date.now();
        this.solveNext(false);
        if (!this.isSolved && Date.now() - start < 3000) {
            this.solve(start);
        }
    }

    static getBlockNumber(row, col) {
        return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
    }
}

class Cell {
    constructor(value, col, row) {
        this.input = null;
        this.resolved = null;
        this.given = value.match(/^\d$/) ? parseInt(value, 10) : null;
        this.row = row;
        this.col = col;
        this.options = Cell.createOptions();
    }

    get value() {
        return this.given || this.input || this.resolved || null;
    }

    get block() {
        return Sudoku.getBlockNumber(this.row, this.col);
    }

    removeOption(num) {
        this.options = this.options.filter(n => n !== num);
    }

    static createOptions() {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
}

class Solution {
    constructor(cell, value) {
        this.cell = typeof toRaw !== 'undefined' ? toRaw(cell) : cell;
        this.value = value;
    }
}

class NakedSingleSolution extends Solution {}

class HiddenSingleSolution extends Solution {}
