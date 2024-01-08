export class Sudoku {
    constructor(str) {
        this.str = str;
        this.cells = [];
        str.split('').forEach((value, index) => {
            this.cells.push(new Cell(index + 1, value, (index % 9) + 1, Math.floor(index / 9) + 1));
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

    ressetOptions() {
        this.cells.forEach((cell) => {
            this.resetCellOptions(cell);
        });
    }

    resetCellOptions(cell) {
        if (cell.value) {
            cell.options = [];
        } else {
            cell.options = Cell.createOptions();
            this.getRow(cell.row).forEach(c => cell.removeOption(c.value));
            this.getCol(cell.col).forEach(c => cell.removeOption(c.value));
            this.getBlock(cell.block).forEach(c => cell.removeOption(c.value));
        }
    }

    throwError() {
        this.cells.forEach((cell) => {
            if (cell.input) {
                cell.options = Cell.createOptions();
                [
                    ['row', this.getRow(cell.row)],
                    ['col', this.getCol(cell.col)],
                    ['block', this.getBlock(cell.block)],
                ].forEach(([type, cells]) => {
                    cells.forEach(c => {
                        if (c.id !== cell.id && c.value === cell.value) throw new Error(`Error in ${type} ${cell[type]} with value ${cell.value}`);
                    })
                });
            }
        });
    }

    get isValid() {
        try {
            this.throwError();
            return true;
        } catch(e) {
            return false;
        }
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

        if (this.isSolved) {
            throw new Error('Sudoku is already solved');
        }

        /**
         * Naked Single
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
         * Hidden Single
         *
         * Bei dieser Methode betrachtet man eine Einheit (Zeile, Spalte oder
         * Block) und eine Ziffer, die noch nicht in dieser Einheit eingetragen
         * ist. Da jede Ziffer in einer Einheit genau einmal vorkommt, muss sie
         * in eines der freien Felder eingetragen werden. Falls es nur noch ein
         * freies Feld in dieser Einheit gibt, in die die Ziffer eingetragen
         * werden kann, ohne dass sie in einer anderen Einheit mehrfach
         * vorkommt, wird sie in dieses Feld eingetragen.
         */
        for (let unitNumber = 1; unitNumber <= 9; unitNumber++) {
            const unitCells = [
                ['row', this.getRow(unitNumber)],
                ['col', this.getCol(unitNumber)],
                ['block', this.getBlock(unitNumber)],
            ];
            for (let [type, cells] of unitCells) {
                const values = this.getValues(cells);
                const options = Cell.createOptions().filter(v => !values.includes(v));
                const emptyCells = cells.filter(c => !c.value);
                for (let option of options) {
                    const cellsWithOption = emptyCells.filter(cell => this.getCellOptions(cell).includes(option))
                    if (cellsWithOption.length === 1) {
                        cellsWithOption[0].resolved = option;
                        this.calcOptions();
                        if (exit) return new HiddenSingleSolution(type, unitNumber, cellsWithOption[0], cellsWithOption[0].resolved);
                    }
                }
            }
        }

        /**
         * Naked Pair
         */
        for (let unitNumber = 1; unitNumber <= 9; unitNumber++) {
            const unitCells = [
                ['row', this.getRow(unitNumber)],
                ['col', this.getCol(unitNumber)],
                ['block', this.getBlock(unitNumber)],
            ];
            for (let [type, cells] of unitCells) {
                const emptyCells = cells.filter(c => !c.value);
                for (let cell of emptyCells) {
                    const options = this.getCellOptions(cell); // cell.options
                    if (options.length === 2) {
                        const cellsWithSameOptions = emptyCells.filter(c => !(c.row === cell.row && c.col === cell.col) && arraysEqual(options, this.getCellOptions(c)))
                        if (cellsWithSameOptions.length === 1) {
                            const cellsToRemoveOptions = emptyCells.filter((emptyCell) => {
                                return emptyCell.id !== cell.id && emptyCell.id !== cellsWithSameOptions[0].id && emptyCell.options.some(o => options.includes(o));
                            });
                            if (cellsToRemoveOptions.length > 0) {
                                cellsToRemoveOptions.forEach(c => {
                                    options.forEach(o => {
                                        c.removeOption(o);
                                    });
                                });
                                if (exit) return new NakedPairSolution(type, unitNumber, cell, cellsWithSameOptions[0], options);
                            }
                        }
                    }
                }
            }
        }

        /**
         * Locked Candidate
         */
        {
            const compareMap = {
                row: ['col', 'block'],
                col: ['row', 'block'],
                block: ['row', 'col'],
            };
            for (let unitNumber = 1; unitNumber <= 9; unitNumber++) {
                const unitCells = [
                    ['row', this.getRow(unitNumber)],
                    ['col', this.getCol(unitNumber)],
                    ['block', this.getBlock(unitNumber)],
                ];
                for (let [type, cells] of unitCells) {
                    for (let option = 1; option <= 9; option++) {
                        const cellsWithOption = cells.filter(c => !c.value).filter(cell => this.getCellOptions(cell).includes(option));
                        if (cellsWithOption.length) {
                            for (let property of compareMap[type]) {
                                const uniqueValues = [...new Set(cellsWithOption.map(cell => cell[property]))];
                                if (uniqueValues.length === 1) {
                                    const houseNumber = uniqueValues[0];
                                    const getterFn = `get${property[0].toUpperCase()}${property.substring(1)}`;
                                    const emptyHouseCells = this[getterFn](houseNumber).filter(c => !c.value);
                                    for (let cell of emptyHouseCells) {
                                        if (cell[type] !== unitNumber) {
                                            if (this.getCellOptions(cell).includes(option)) { // cell.options
                                                // cell.removeOption(option);
                                                const filteredOptions = this.getCellOptions(cell).filter(o => o !== option);
                                                if (filteredOptions.length === 1) {
                                                    cell.resolved = filteredOptions[0];
                                                    this.calcOptions();
                                                    if (exit) return new LockedCandidateSolution(cell, filteredOptions[0], type, property, houseNumber);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // solve cells with only one option left
        {
            const cells = this.cells.filter(c => !c.value);
            for (let cell of cells) {
                if (cell.options.length === 1) {
                    cell.resolved = cell.options[0];
                    this.calcOptions();
                    if (exit) return new SingleOptionsLeftSolution(cell, cell.resolved);

                }
            }
        }

        if (exit) {
            throw new Error('This seems to be a difficult Sudoku. No other number could be found with any existing algorithm.');
        }
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
    constructor(id, value, col, row) {
        this.id = id;
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
    static toRaw(value) {
        return typeof toRaw !== 'undefined' ? toRaw(value) : value;
    }
}

class NakedSingleSolution extends Solution {
    constructor(cell, value) {
        super();
        this.cell = Solution.toRaw(cell);
        this.value = value;
    }
}

class SingleOptionsLeftSolution extends Solution {
    constructor(cell, value) {
        super();
        this.cell = Solution.toRaw(cell);
        this.value = value;
    }
}


class HiddenSingleSolution extends Solution {
    constructor(type, unitNumber, cell, value) {
        super();
        this.type = type;
        this.unitNumber = unitNumber;
        this.cell = Solution.toRaw(cell);
        this.value = value;
    }
}

class NakedPairSolution extends Solution {
    constructor(type, unitNumber, cell1, cell2, options) {
        super();
        this.type = type;
        this.unitNumber = unitNumber;
        this.cell1 = Solution.toRaw(cell1);
        this.cell2 = Solution.toRaw(cell2);
        this.options = options;
    }
}

class LockedCandidateSolution extends Solution {
    constructor(cell, value, type, intersectionType, intersectionNumber) {
        super();
        this.cell = Solution.toRaw(cell);
        this.value = value;
        this.type = type;
        this.intersectionType = intersectionType;
        this.intersectionNumber = intersectionNumber;
    }
}
