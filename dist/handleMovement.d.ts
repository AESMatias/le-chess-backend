type Piece = {
    piece: string;
    row: number;
    col: number;
};
export declare const handleMovement: (pieceObject: Piece, row: number, col: number, board: string[][], whoGoes: string) => {
    processedBoard: string[][];
    isMate: boolean;
    winner: string;
    isMateResult?: undefined;
} | {
    processedBoard: string[][];
    isMateResult: string | boolean | (string | boolean)[];
    winner: string | boolean | (string | boolean)[];
    isMate?: undefined;
} | undefined;
export {};
