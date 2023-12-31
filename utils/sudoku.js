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

    rowHasNumber(row, num) {
        return this.getRow(row).map(c => c.value).includes(num);
    }

    colHasNumber(col, num) {
        return this.getCol(col).map(c => c.value).includes(num);
    }

    blockHasNumber(block, num) {
        return this.getBlock(block).map(c => c.value).includes(num);
    }

    get isSolved() {
        return this.cells.every(cell => cell.value);
    }

    solve(ts) {
        const start = ts || +new Date();
    
        // Methode des nackten Einers
        this.cells.forEach(cell => {
            const rowValues = this.getRow(cell.row).map(c => c.value).filter(c => c);
            const colValues = this.getCol(cell.col).map(c => c.value).filter(c => c);
            const blockValues = this.getBlock(cell.block).map(c => c.value).filter(c => c);
            const values = [...new Set([...rowValues, ...colValues, ...blockValues])]; // Set not needed here
            const options = Cell.createOptions().filter(v => !values.includes(v));
            console.log(cell.row, cell.col, values, options);
        });

        // solve cells with a single option left
        this.cells.forEach(cell => {
            if (cell.options.length === 1) {
                cell.resolved = cell.options[0];
                this.calcOptions();
            }
        });

        if(!this.isSolved && +new Date() - start < 1000) {
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
