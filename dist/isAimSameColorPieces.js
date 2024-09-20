"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAimSameColorPieces = void 0;
const isAimSameColorPieces = (board, currentPosition, toPosition) => {
    let isSameColor = true;
    const currentRow = currentPosition['row'];
    const currentCol = currentPosition['col'];
    const toRow = toPosition['row'];
    const toCol = toPosition['col'];
    const currentPieceColor = board[currentRow][currentCol].split('_')[0];
    const toPieceColor = board[toRow][toCol].split('_')[0];
    isSameColor = (currentPieceColor !== toPieceColor) ? false : true;
    return (isSameColor);
};
exports.isAimSameColorPieces = isAimSameColorPieces;
exports.default = exports.isAimSameColorPieces;
