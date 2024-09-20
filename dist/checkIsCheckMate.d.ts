import { pieceObject } from "./Types";
export declare const isCheckMate: (row: number, col: number, whoGoes: string, board: string[][], kingWhitePos: pieceObject, kingBlackPos: pieceObject) => (string | boolean)[] | (string | (string | boolean)[])[];
