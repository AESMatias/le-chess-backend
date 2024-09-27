import { MovementIsValid } from './MovementIsValid';
import { checkKingsPositions } from './kingPositions';
import { isInDanger } from './isInDanger';
import { isCheckMate } from './checkIsCheckMate';
import { caseCastling } from './caseCastling'
import { pieceObjectType } from './Types'


export const handleMovement = (pieceObject: pieceObjectType, row: number, col: number,
   board:string[][], whoGoes:string) => {

    const draggedPiece = pieceObject;

    const pieceColor = draggedPiece.piece.split('_')[0];

    const kingsPositions = checkKingsPositions(board);

    let kingBlackPos = kingsPositions.kingBlackPos;
    let kingBlackRow = kingsPositions.kingBlackPos.row;
    let kingBlackCol = kingsPositions.kingBlackPos.col;

    let kingWhitePos = kingsPositions.kingWhitePos;
    let kingWhiteRow = kingsPositions.kingWhitePos.row;
    let kingWhiteCol = kingsPositions.kingWhitePos.col;

    let castlingCounter = 0;
    let kingMovTo = null;
    let rookMovTo = null;

    // if (kingWhiteCol === -1 || kingWhiteRow === -1) {
    //   console.log('CheckMate: King White not found');
    //   return {processedBoard: board, isMate: true, winner: 'Black'};
    // }

    // if (kingBlackCol === -1 || kingBlackRow === -1 || kingWhiteCol === -1 || kingWhiteRow === -1) {
    //   console.log('CheckMate: King Black not found');
    //   return {processedBoard: board, isMate: true, winner: 'White'};
    // }

    const {isValid, castlingEvent, movToDo, kingTo} = MovementIsValid(board,
       draggedPiece.piece,
       {row: draggedPiece.row, col: draggedPiece.col},
       {row, col},
       pieceObject);

    kingMovTo = kingTo;
    rookMovTo = movToDo


    if (draggedPiece.row === row && draggedPiece.col === col) {
      return {processedBoard: board, isMate: false, winner: '', castlingCounter, movToDo, kingMovTo: null};
    }

    if (draggedPiece && isValid) {

  
      let kingWhiteDanger = false;
      let kingBlackDanger = false;

      if (whoGoes !== pieceColor) { //TODO: Legitimize to admit the user only moves his pieces
        console.log('whoGoes:', whoGoes, 'pieceColor:', pieceColor);
        console.log('You cannot move the other player pieces');
        return {processedBoard: board, isMate: false, winner: '', castlingCounter, movToDo, kingMovTo: null};
      }
  
      //We need to update the position of the king after each movement
      if (draggedPiece.piece === 'White_King') {
        kingWhiteRow = row;
        kingWhiteCol = col;
        const returnedDanger = isInDanger(board, 'White_King', {row, col}, pieceObject);
        kingWhiteDanger = returnedDanger.inDanger;


        console.error('indanger returns', returnedDanger);
        
        
        if (kingWhiteDanger) {
          console.error('Check! White King in danger');
          return {processedBoard: board, isMate: false, winner: 'Black', castlingCounter, movToDo, kingMovTo: null};
        }
        // setKingWhitePos({ row, col, piece: 'White_King' }); 
        kingWhitePos = { row, col, piece: 'White_King' };
      }
      
      if (draggedPiece.piece === 'Black_King') {
        kingBlackRow = row;
        kingBlackCol = col;
        const returnedDanger = isInDanger(board, 'Black_King', {row, col}, pieceObject);
        kingBlackDanger = returnedDanger.inDanger;

        if (kingBlackDanger) {
          console.error('Check! Black King in danger');
          return {processedBoard: board, isMate: false, winner: 'White', castlingCounter, movToDo, kingMovTo: null};
        }
        // setKingBlackPos({ row, col, piece: 'Black_King' }); 
        kingBlackPos = { row, col, piece: 'Black_King' };
      }
    
      if (draggedPiece.piece.split('_')[1] !== 'King') {
      const returnedDangerWhite = isInDanger(board, 'White_King', {row: kingWhiteRow, col: kingWhiteCol}, pieceObject);
      const returnedDangerBlack = isInDanger(board, 'Black_King', {row: kingBlackRow, col: kingBlackCol}, pieceObject);
      

      kingWhiteDanger = returnedDangerWhite.inDanger;
      kingBlackDanger = returnedDangerBlack.inDanger;
      }

      // // TODO: TODO: Check if there's conflict when the two kings are in danger!    

      //Check if the king's are moving to a check position, if so, don't allow the movement and show a message 
      
      // TODO: Fix this two ifs, for a more realistic game mode, we decided to allow the player to move the king to a dangerous position
      // if (kingWhiteDanger && draggedPiece.piece !== 'White_King'
      //   && draggedPiece.piece.split('_')[0] === 'White') {
      //   console.error('White King in danger, you cannot MOVE THIS PIECE');
      //   return;
      // }
      // if (kingBlackDanger && draggedPiece.piece !== 'Black_King'
      //   && draggedPiece.piece.split('_')[0] === 'Black') {
      //     console.error('BLACK King in danger, you cannot MOVE THIS PIECE');
      //   return;
      // }

    //   setWhoGoes(whoGoes === 'White' ? 'Black' : 'White');
      whoGoes = whoGoes === 'White' ? 'Black' : 'White';


      const {isCastling} = caseCastling(board, draggedPiece.piece,
        {row: draggedPiece.row, col: draggedPiece.col},
        {row, col}, pieceObject);
  
      if (isCastling) {

        castlingCounter++;
        const newBoard = board.slice();
        newBoard[draggedPiece.row][draggedPiece.col] = '';

        const isMate = isCheckMate(row, col, whoGoes, board, kingWhitePos, kingBlackPos, pieceObject);
        const isMateResult = isMate[0];
        const winner = isMate[1];

        //Also, we move the rook:
        newBoard[5][movToDo.col] = `${pieceColor}_Rook`;
        newBoard[kingMovTo.row][kingMovTo.col] = draggedPiece.piece;


  
        return { processedBoard: newBoard, isMateResult, winner, castlingCounter, movToDo, kingMovTo };
      }

      
  
    //   setStepsCounter(stepsCounter + 1);
      const newBoard = board.slice();
      newBoard[draggedPiece.row][draggedPiece.col] = '';
      newBoard[row][col] = draggedPiece.piece;
      // setBoard(newBoard);
    //   sendRequestMove(row, col, draggedPiece.piece);
      
      const isMate = isCheckMate(row, col, whoGoes, board, kingWhitePos, kingBlackPos, pieceObject);

      const isMateResult = isMate[0];
      const winner = isMate[1];

      
      // ///////
      // whoGoes = whoGoes === 'White' ? 'White' : 'Black';
      // const isMateOpposite = isCheckMate(row, col, whoGoes, board, kingWhitePos, kingBlackPos);
      // const isMateResultOpposite = isMateOpposite[0];
      // const winnerOpposite = isMateOpposite[1];
      // if (isMateResultOpposite) {
      //   console.error('PASOOOOOOOOOOOOOOOOOO')
      //   console.error('CheckMate! The game is over');
      //   return { processedBoard: board, isMate: true, winner: winnerOpposite };
      // }
      // ///////


      return { processedBoard: newBoard, isMateResult, winner, castlingCounter, movToDo, kingMovTo };
    }
  };
