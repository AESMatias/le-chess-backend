
export const checkKingsPositions = (board: string[][]) => {

    let kingWhitePos = { row: -1, col: -1, piece: 'White_King' };
    let kingBlackPos = { row: -1, col: -1, piece: 'Black_King' };

    board.forEach((row, rowIndex) => {
        let kingsCounter = 0;

        row.forEach((col, colIndex) => {

            if (col === 'White_King') {
                kingWhitePos = { row: rowIndex, col: colIndex, piece: 'White_King' };
                kingsCounter++;
            }

            if (col === 'Black_King') {
                kingBlackPos = { row: rowIndex, col: colIndex, piece: 'Black_King' };
                kingsCounter++;
            }

            if (kingsCounter === 2) {
                return;
            }
        })
        
        if (kingsCounter === 2) {
            return;
        }
    }
    )
    return { kingWhitePos, kingBlackPos};
}