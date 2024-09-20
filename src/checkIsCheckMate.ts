import { isInDanger } from "./isInDanger";
import { MovementIsValid } from "./MovementIsValid";
import { pieceObject } from "./Types";

interface DangerPiece {
    piece: string;
    position: { row: number; col: number };
}


  
export const isCheckMate = (row:number, col:number, whoGoes:string, board: string[][], 
    kingWhitePos: pieceObject, kingBlackPos: pieceObject) => {


    const kingBlackRow = kingBlackPos.row;
    const kingBlackCol = kingBlackPos.col;

    const kingWhiteRow = kingWhitePos.row;
    const kingWhiteCol = kingWhitePos.col;

    const objectKingWhite = isInDanger(board, 'White_King', {row: kingWhiteRow, col: kingWhiteCol});
    const objectKingBlack = isInDanger(board, 'Black_King', {row: kingBlackRow, col: kingBlackCol});

    const checkIsCheckMate = (row:number, col:number, kingColor:string) => {

      console.log('***The King is in danger, let\'s check if it\'s checkmate***');

      const possibleMoves = [
        {row: row+1, col: col},
        {row: row-1, col: col},
        {row: row, col: col+1},
        {row: row, col: col-1},
        {row: row+1, col: col+1},
        {row: row+1, col: col-1},
        {row: row-1, col: col+1},
        {row: row-1, col: col-1},
      ];

      let possibleDangerPieces = [];
      const actualDangerPieces: DangerPiece[] = [];

      if(whoGoes === 'White') {
      possibleDangerPieces = objectKingWhite.currentDangerPiecesLineal
      .concat(objectKingWhite.currentDangerPicesDiagonal)
      .concat(objectKingWhite.currentKnightPathPieces);
      } else {
        possibleDangerPieces = objectKingBlack.currentDangerPiecesLineal
        .concat(objectKingBlack.currentDangerPicesDiagonal)
        .concat(objectKingBlack.currentKnightPathPieces);
      }

      console.log('PossibleDangerPieces', possibleDangerPieces);

      let isCheckMate = true;


      possibleDangerPieces?.forEach((piece) => {
        
        if (kingColor === 'White') {
          const validDanger = MovementIsValid(board, piece.piece, piece.position, kingWhitePos) ? true : false;
          
          if (validDanger) {
            actualDangerPieces.push(piece);
          }

        }

        if (kingColor === 'Black') {
          const validDanger = MovementIsValid(board, piece.piece, piece.position, kingBlackPos) ? true : false;

          if (validDanger) {
            actualDangerPieces.push(piece);
          }

        }
        });



        //TODO: If we check, down below, all the pieces, this for loop wouldn't be necessary, delete it!
      for (let i = 0; i < possibleMoves.length; i++) {

        if (possibleMoves[i].row < 0 || possibleMoves[i].row > 7 || possibleMoves[i].col < 0 || possibleMoves[i].col > 7) {
          continue;
        }

        if (!MovementIsValid(board, `${kingColor}_King`, {row, col}, possibleMoves[i])) {
          continue;
        }

        const returnedDanger = isInDanger(board, `${kingColor}_King`, possibleMoves[i]);
        const isDanger = returnedDanger.inDanger;

        if (!isDanger) {
          //We can push to an array the possible moves the king can do in order to scape
          console.log(`The king ${kingColor} would be not in danger if does the movement: `, possibleMoves[i]);
          //Once we have the possible moves, we need to check recursively if these moves are dangerous or not
          isCheckMate = false;
          break;
        }
      }

      
      console.log('ActualDangerPieces', actualDangerPieces);
      // let dangerousPossibleEatablePieces = [];

      const colorPiecesToSearch = (kingColor === 'White') ? 'White' : 'Black';

    actualDangerPieces.forEach((actualDangerPiece) => {

        board.forEach((rowArray, row) => {

          rowArray.forEach((piece, col) => {

              if(piece.split('_')[0] === colorPiecesToSearch) {

              //TODO: Refactor this two ifs statements into a more compact one

                const isValid = MovementIsValid(board, piece, {row, col},
                  {row: actualDangerPiece.position.row, col: actualDangerPiece.position.col});

                if (isValid) {
                  // dangerousPossibleEatablePieces.push({piece, position: {row, col}});
                  
                  console.log('HAY UNA SALIDA AL JAQUE EN:::::', piece, {row, col},
                    'que se debe mover hacia', actualDangerPiece.position);

                  isCheckMate = false;

                }

            }

            });

          });

      });


      if (isCheckMate) {
        console.log('CHECKMATE');
        return [true, kingColor];
      }
      return [false, ''];
    }

    /// ---------------------------- ///
    if (objectKingWhite.inDanger ) {

      console.log('Check! The king is in danger');
      const isMate = checkIsCheckMate(kingWhiteRow, kingWhiteCol,`Black`);

        if (isMate) {
          return [isMate, 'White'];
        }
        return [isMate, ''];
    }


    if (objectKingBlack.inDanger) {

      console.log('Check! The king is in danger');
      const isMate = checkIsCheckMate(kingBlackRow, kingBlackCol,`Black`);

        if (isMate) {
          return [isMate, 'Black'];
        }
        return [isMate, ''];
    }

    return [false, ''];
  }