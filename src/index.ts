import express, { Express, Request, Response } from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import { handleMovement } from './handleMovement';
import { checkKingsPositions } from './kingPositions';


// app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

const app: Express = express();
const server = createServer(app);

app.use(cors({
  origin: '*',
}));

// const io = new SocketIOServer(server);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

type Board = string[][];

interface Player {
  color: 'White' | 'Black';
  // elo: number; 
  // username: string;
  // nickname: string;
  // avatar: string;
}

interface GameData {
  board: Board;
  whitePlayer: Player | null;
  blackPlayer: Player | null;
  currentTurn: 'White' | 'Black';
  currentCounter: number;
  currentCastlingWhite: number;
  currentCastlingBlack: number;
}

app.get('/', (req, res) => {
  res.send('Hello, this is the LeChess Backend!');
});

const usersSockets: Record<string, Socket> = {}; // The socket of the users, we find the user by the socket id
const games: Record<string, GameData> = {}; // Games by socket id

io.on('connection', (socket) => {

    if (Object.keys(games).length === 0) { 
      usersSockets[socket.id] = socket;

      const emptyBoard = createChessboard();
      const initialBoard: Board = generateBlackPieces(generateWhitePieces(emptyBoard));
      
      const myWhitePlayer:Player = {
        color: 'White',
      }

      games[socket.id] = { 
        board: initialBoard,
        whitePlayer: myWhitePlayer,
        blackPlayer: null,
        currentTurn: 'White',
        currentCounter: 0,
        currentCastlingWhite: 0,
        currentCastlingBlack: 0,
      };

      let currentCounter = games[socket.id].currentCounter
      currentCounter++;
      games[socket.id].currentCounter = currentCounter;

      const whoGoes = currentCounter % 2 === 0 ? 'White' : 'Black';

      socket.emit('currentBoard', games[socket.id].board, whoGoes);

      // games[socket.id]['board'] = initialBoard
      // games[socket.id]['whitePlayer'] = myWhitePlayer;
      // games[socket.id]['blackPlayer'] = null;
      // games[socket.id]['currentTurn'] = 'White';
      console.log(`Socker number ${Object.keys(games).length} connected!`);
    }

    else {

      const myBlackPlayer:Player = {
        color: 'Black',
      }

      const firstGameId = Object.keys(games)[0];
      games[firstGameId].blackPlayer = myBlackPlayer;
      // games[firstGameId].currentTurn = 'White';

      let currentCounter = games[firstGameId].currentCounter
      currentCounter++;
      games[firstGameId].currentCounter = currentCounter;
      const whoGoes = currentCounter % 2 === 0 ? 'White' : 'Black';

      console.log('The game is now:', games[firstGameId].currentTurn);


      socket.emit('currentBoard', games[firstGameId].board, whoGoes);
      console.log(`Socker number ${Object.keys(games).length} connected!`);
    }


  // socket.emit('currentBoard', games[socket.id].board);

  socket.on('message', (message) => {
    console.log(typeof message);
    console.log('message received:', message);
    io.emit('message', message);
  });


  const checkMateEarly = (board: string[][], isMate: boolean) => {
    const kingsPositions = checkKingsPositions(board);

    let kingBlackPos = kingsPositions.kingBlackPos;
    let kingBlackRow = kingsPositions.kingBlackPos.row;
    let kingBlackCol = kingsPositions.kingBlackPos.col;

    let kingWhitePos = kingsPositions.kingWhitePos;
    let kingWhiteRow = kingsPositions.kingWhitePos.row;
    let kingWhiteCol = kingsPositions.kingWhitePos.col;


    if (kingWhiteCol === -1 || kingWhiteRow === -1) {
      console.log('CheckMate: King White not found');
      return {processedBoard: board, isMate: true, winner: 'Black'};
    }

    if (kingBlackCol === -1 || kingBlackRow === -1 || kingWhiteCol === -1 || kingWhiteRow === -1) {
      console.log('CheckMate: King Black not found');
      return {processedBoard: board, isMate: true, winner: 'White'};
    }
    return {processedBoard: board, isMate, winner: ''};
  }

  socket.on('RequestMove', (row, col, piece) => {
    const firstGameId = Object.keys(games)[0];
    console.log('Move received:', row, col, 'piece:',piece);
    
    let processedBoard: string[][] | undefined;
    let isMate: boolean = false;
    let movToDoRook: any = null;
    let movToDoKing: any = null;
    const boardWithoutMove = games[firstGameId].board;
    const pieceColor = piece.piece.split('_')[0];
    const whiteCastlingCount = games[firstGameId].currentCastlingWhite;
    const blackCastlingCount = games[firstGameId].currentCastlingBlack;
    let isCurrentValidMov = true; //TODO: Do es not validate anything, isn't doing it?


    const result = handleMovement(piece, row, col, games[firstGameId].board, games[firstGameId].currentTurn);


    if (!(result)) {
      console.error('Movement is invalid or undefined');
      return;
    }
    movToDoRook = result.movToDo;
    movToDoKing = result.kingMovTo;

    processedBoard = result.processedBoard;
    isMate = result.isMate || false;
    const { castlingCounter } = result;

    if (castlingCounter === 1 && pieceColor === 'Black') { 

      //If the catlingCounter is 1, then the castling is valid. TODO: change this to a boolean, it's easy
      games[firstGameId].currentCastlingBlack = castlingCounter;

      if (blackCastlingCount > 1) {
        console.error('Black has already castled');
        isCurrentValidMov = false;
      }

    }

    if (castlingCounter === 1 && pieceColor === 'White') {

      games[firstGameId].currentCastlingWhite = castlingCounter;
      if (whiteCastlingCount > 1) {
        console.error('White has already castled');
        isCurrentValidMov = false;
      }
    }

    //If the mov is Castling and has been already done, then it's invalid:
    if (isCurrentValidMov === false) {
      console.error('Invalid movement, castling has been already done');
      return;
    }

    const resultEarly = checkMateEarly(processedBoard, isMate);

    if (resultEarly.winner.length > 2) {
      io.emit('currentBoard', boardWithoutMove, games[firstGameId].currentTurn, isMate);
      io.emit('checkMate', resultEarly.winner);
      io.close();
      return;
    }

  
    games[firstGameId].currentTurn = games[firstGameId].currentTurn === 'White' ? 'Black' : 'White';
    io.emit('currentBoard', processedBoard, games[firstGameId].currentTurn);

    // if (movToDoRook !== null && movToDoKing !== null) {
    //   io.emit('currentBoard', processedBoard, games[firstGameId].currentTu
    // }

    if (isMate) {
      io.emit('currentBoard', boardWithoutMove, games[firstGameId].currentTurn, isMate);
      io.emit('checkMate', games[firstGameId].currentTurn);
      io.close();
      return;
    }
    
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket);
    console.log('User disconnected, cleaning the board of', socket.id, '...');
  });

});

server.listen(PORT, () => {
  console.log(`Server listening in the port ${PORT}`);
});

const createChessboard = () => {
  const board: string[][] = [];

  for (let row = 0; row < 8; row++) {
    board[row] = [];

    for (let col = 0; col < 8; col++) {
      board[row][col] = ''; 
    }

  }
  return board;
}

// We se parate the generation of the pieces in two functions, for animation purposes in the near future.
const generateWhitePieces = (board: string[][]) => {
  board[0][0] = 'White_Rook';
  board[0][1] = 'White_Knight';
  board[0][2] = 'White_Bishop'; 
  board[0][3] = 'White_Queen';
  board[0][4] = 'White_King';
  board[0][5] = 'White_Bishop';
  board[0][6] = 'White_Knight';
  board[0][7] = 'White_Rook';

  for (let col = 0; col < 8; col++) {
    board[1][col] = 'White_Pawn'; 
  }

  return board;
}

const generateBlackPieces = (board: string[][]) => {
  board[7][0] = 'Black_Rook';
  board[7][1] = 'Black_Knight';
  board[7][2] = 'Black_Bishop';
  board[7][3] = 'Black_Queen';
  board[7][4] = 'Black_King';
  board[7][5] = 'Black_Bishop';
  board[7][6] = 'Black_Knight';
  board[7][7] = 'Black_Rook';

  for (let col = 0; col < 8; col++) {
    board[6][col] = 'Black_Pawn';
  }

  return board;
}