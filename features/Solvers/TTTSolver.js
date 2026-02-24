import c from "../../config"
import RenderUtils from "../../util/renderUtils"
import { Blocks } from "../../util/utils";

const DungeonUtils = Java.type("com.odtheking.odin.utils.skyblock.dungeon.DungeonUtils");
const EntityItemFrame = Java.type("net.minecraft.entity.decoration.ItemFrameEntity")

const State = { BLANK: 0, X: 1, O: 2 };
let bestMoveBlockPos = null;
let isScanning = false;

const TTTsolver = register("tick", () => {
    if (isScanning || !DungeonUtils.INSTANCE.inDungeons) return;
    if (DungeonUtils.INSTANCE.currentRoomName !== "Tic Tac Toe") {
        bestMoveBlockPos = null;
        renderTTT.unregister()
        return;
    }
    isScanning = true
    renderTTT.register()
    new Thread(() => {
        try {
            const frames = World.getAllEntitiesOfType(EntityItemFrame).filter(frame => {
                const itemFrame = frame.toMC();
                const pos = itemFrame.getBlockPos();
                if (pos.getY() < 70 || pos.getY() > 72) return false;

                const itemStack = itemFrame.getHeldItemStack();
                return itemStack && itemStack.getItem().toString() === "minecraft:filled_map";
            });

            if (frames.length > 0) {
                solveTicTacToe(frames);
            }
        } catch (e) {
            console.error("TicTacToe Thread Error: " + e);
        } finally {
            Thread.sleep(50);
            isScanning = false;
        }
    }).start();
}).unregister()

function solveTicTacToe(frames) {
    let board = new TicTacToeBoard();
    let topLeft = null;
    let roomFacing = null;

    frames.forEach(frame => {
        const itemFrame = frame.toMC()
        const realPos = itemFrame.getBlockPos();
        if (!itemFrame.facing) return; 

        const facing = itemFrame.facing.getOpposite()
        const blockBehind = realPos.offset(facing, 1)

        let row = 72 - realPos.getY();
        if (row < 0 || row > 2) return;

        const leftDir = facing.rotateYCounterclockwise();
        const rightDir = facing.rotateYClockwise();
        const leftBlock = World.getWorld().getBlockState(blockBehind.offset(leftDir)).getBlock();
        const rightBlock = World.getWorld().getBlockState(blockBehind.offset(rightDir)).getBlock();

        let column;
        if (leftBlock !== Blocks.IRON_BLOCK) column = 0;
        else if (rightBlock !== Blocks.IRON_BLOCK) column = 2;
        else column = 1;

        if (!topLeft) {
            topLeft = realPos.up(row).offset(leftDir, column);
            roomFacing = facing; 
        }

        const itemStack = itemFrame.getHeldItemStack();
        const mapData = itemStack.getItem().getMapState(itemStack, World.getWorld());
        if (!mapData) return;

        const colorByte = mapData.colors[8256] & 255;
        let foundState = State.BLANK;
        if (colorByte === 114) foundState = State.X;
        else if (colorByte === 33) foundState = State.O;

        board.grid[row][column] = foundState;
        if (foundState !== State.BLANK) board.moveCount++;
    });

    if (!topLeft || board.checkWinner() !== 0) {
        bestMoveBlockPos = null;
        return;
    }

    let isPlayersTurn = (board.moveCount % 2 !== 0); 
    
    if (!isPlayersTurn) {
        bestMoveBlockPos = null;
        return;
    }

    let finalMoveIdx = -1;
    let bestScore = -Infinity;
    board.turn = State.O;

    board.getAvailableMoves().forEach(move => {
        let tempBoard = board.copy();
        tempBoard.move(move);
        let score = minimax(tempBoard, 0, -Infinity, Infinity, false, State.O);
        if (score > bestScore) {
            bestScore = score;
            finalMoveIdx = move;
        }
    });

    if (finalMoveIdx !== -1) {
        let r = Math.floor(finalMoveIdx / 3);
        let c = finalMoveIdx % 3;
        bestMoveBlockPos = topLeft.down(r).offset(roomFacing.rotateYClockwise(), c);
    } else {
        bestMoveBlockPos = null;
    }
}

const renderTTT = register("renderWorld", () => {
    if (bestMoveBlockPos) {
        RenderUtils.drawOutline(RenderUtils.getBox(bestMoveBlockPos.getX() + 0.5, bestMoveBlockPos.getY(), bestMoveBlockPos.getZ() + 0.5, 1, 1), [1, 0, 0, 1], true, 2)
    }
}).unregister()

register("worldLoad", () => {
    bestMoveBlockPos = null;
    renderTTT.unregister()
});


class TicTacToeBoard {
    constructor() {
        this.grid = Array(3).fill(0).map(() => Array(3).fill(State.BLANK));
        this.turn = State.X;
        this.moveCount = 0;
    }

    copy() {
        let newBoard = new TicTacToeBoard();
        newBoard.grid = this.grid.map(row => [...row]);
        newBoard.turn = this.turn;
        newBoard.moveCount = this.moveCount;
        return newBoard;
    }

    getAvailableMoves() {
        let moves = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (this.grid[r][c] === State.BLANK) moves.push(r * 3 + c);
            }
        }
        return moves;
    }

    move(index) {
        let r = Math.floor(index / 3);
        let c = index % 3;
        this.grid[r][c] = this.turn;
        this.moveCount++;
        this.turn = (this.turn === State.X) ? State.O : State.X;
    }

    checkWinner() {
        const g = this.grid;
        for (let i = 0; i < 3; i++) {
            if (g[i][0] !== 0 && g[i][0] === g[i][1] && g[i][0] === g[i][2]) return g[i][0];
            if (g[0][i] !== 0 && g[0][i] === g[1][i] && g[0][i] === g[2][i]) return g[0][i];
        }
        if (g[0][0] !== 0 && g[0][0] === g[1][1] && g[0][0] === g[2][2]) return g[0][0];
        if (g[0][2] !== 0 && g[0][2] === g[1][1] && g[0][2] === g[2][0]) return g[0][2];
        return (this.moveCount === 9) ? -1 : 0;
    }
}

function minimax(board, depth, alpha, beta, isMaximizing, aiPlayer) {
    let result = board.checkWinner();
    if (result !== 0) {
        if (result === aiPlayer) return 10 - depth;
        if (result === -1) return 0;
        return depth - 10;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        let moves = board.getAvailableMoves();
        for (let i = 0; i < moves.length; i++) {
            let nextBoard = board.copy();
            nextBoard.move(moves[i]);
            let score = minimax(nextBoard, depth + 1, alpha, beta, false, aiPlayer);
            bestScore = Math.max(score, bestScore);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        let moves = board.getAvailableMoves();
        for (let i = 0; i < moves.length; i++) {
            let nextBoard = board.copy();
            nextBoard.move(moves[i]);
            let score = minimax(nextBoard, depth + 1, alpha, beta, true, aiPlayer);
            bestScore = Math.min(score, bestScore);
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        return bestScore;
    }
}

if (c.TTTSolver) TTTsolver.register()

c.registerListener("TTT Solver", (curr) => {
    if (curr) TTTsolver.register()
    else TTTsolver.unregister()
})