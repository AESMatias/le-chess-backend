import { Coords } from './Types';
type PieceWithCoords = {
    piece: string;
    position: Coords;
};
type returnedObject = {
    inDanger: boolean;
    currentDangerPiecesLineal: PieceWithCoords[];
    currentDangerPicesDiagonal: PieceWithCoords[];
    currentKnightPathPieces: PieceWithCoords[];
};
export declare const isInDanger: (board: string[][], pieceId: string, currentPosition: Coords) => returnedObject;
export {};
