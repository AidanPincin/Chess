const pieceMoves = {
    'Queen': function(piece,state,moveHistory,check=true){
        const directions = [[1,0],[1,1],[0,1],[-1,1],[1,-1],[0,-1],[-1,0],[-1,-1]]
        const moves = []
        for(let i=0; i<directions.length; i++){
            for(let num=1; num<8; num++){
                const pos = { row: piece.pos.row+directions[i][0]*num, col: piece.pos.col+directions[i][1]*num}
                if(state.find(p => checkPos(p.pos,pos) && p.color == piece.color) || pos.row<0 || pos.row>7 || pos.col<0 || pos.col>7){ 
                    break
                }
                else{
                    if(check == false || ifCheck(piece,pos,moveHistory,state) == false){
                        if(state.find(p => checkPos(p.pos,pos))){
                            moves.push(pos)
                            break
                        }
                        moves.push(pos)
                    }
                }
            }
        }
        return moves
    },
    'King': function(piece,state,moveHistory,check=true){
        const directions = [[1,0],[1,1],[0,1],[-1,1],[1,-1],[0,-1],[-1,0],[-1,-1]]
        const moves = []
        for(let i=0; i<directions.length; i++){
            const pos = { row: piece.pos.row+directions[i][0], col: piece.pos.col+directions[i][1]}
            if(state.find(p => checkPos(p.pos,pos) && p.color == piece.color) == undefined && pos.row>=0 && pos.row<=7 && pos.col>=0 && pos.col<=7 && (check == false || ifCheck(piece,pos,moveHistory,state) == false)){ 
                moves.push(pos)
            }
        }
        const index = ['black','white'].findIndex(c => piece.color == c)
        if(moveHistory.find(mH => JSON.parse(mH.piece).name == 'King' && JSON.parse(mH.piece).color == piece.color) == undefined){
            const rooks = state.filter(p => p.name == 'Rook' && p.color == piece.color)
            for(let i=0; i<rooks.length; i++){
                if(checkPos(rooks[i].pos,{ row: index*7, col: 0 }) && moveHistory.find(mH => checkPos(JSON.parse(mH.piece).pos,{ row: index*7, col: 0})) == undefined){
                    if((state.find(p => checkPos(p.pos,{row:index*7,col:1}) || checkPos(p.pos,{row:index*7,col:2}) || checkPos(p.pos,{row:index*7,col:3})) == undefined) && ifCheck(piece,{row:index*7,col:2},moveHistory,state) == false && ifCheck(piece,{row:index*7,col:3},moveHistory,state) == false){
                        moves.push({row:index*7,col:2})
                    }
                }
                else if(checkPos(rooks[i].pos,{ row: index*7, col: 7}) && moveHistory.find(mH => checkPos(JSON.parse(mH.piece).pos,{ row: index*7, col: 7})) == undefined){
                    if((state.find(p => checkPos(p.pos,{row:index*7,col:5}) || checkPos(p.pos,{row:index*7,col:6})) == undefined) && ifCheck(piece,{row:index*7,col:6},moveHistory,state) == false && ifCheck(piece,{row:index*7,col:5},moveHistory,state) == false){
                        moves.push({row:index*7,col:6})
                    }
                }
            }
        }
        return moves
    },
    'Knight': function(piece,state,moveHistory,check=true){
        const directions = [[2,1],[-2,1],[-2,-1],[2,-1],[1,2],[-1,-2],[-1,2],[1,-2]]
        const moves = []
        for(let i=0; i<directions.length; i++){
            const pos = { row: piece.pos.row+directions[i][0], col: piece.pos.col+directions[i][1]}
            if(state.find(p => checkPos(p.pos,pos) && p.color == piece.color) == undefined && pos.row>=0 && pos.row<=7 && pos.col>=0 && pos.col<=7 && (check == false || ifCheck(piece,pos,moveHistory,state) == false)){
                moves.push(pos)
            }
        }
        return moves
    },
    'Bishop': function(piece,state,moveHistory,check=true){
        const directions = [[1,1],[-1,-1],[1,-1],[-1,1]]
        const moves = []
        for(let i=0; i<directions.length; i++){
            for(let num=1; num<8; num++){
                const pos = { row: piece.pos.row+directions[i][0]*num, col: piece.pos.col+directions[i][1]*num}
                if(state.find(p => checkPos(p.pos,pos) && p.color == piece.color) || pos.row<0 || pos.row>7 || pos.col<0 || pos.col>7){ 
                    break
                }
                else{
                    if(check == false || ifCheck(piece,pos,moveHistory,state) == false){
                        if(state.find(p => checkPos(p.pos,pos))){
                            moves.push(pos)
                            break
                        }
                        moves.push(pos)
                    }
                }
            }
        }
        return moves
    },
    'Pawn': function(piece,state,moveHistory,check=true){
        const moves = []
        const colors = ['black','white']
        const index = colors.findIndex(color => color == piece.color)
        let pos = { row: piece.pos.row+1-index*2, col: piece.pos.col}
        if(state.find(p => checkPos(p.pos,pos)) == undefined && pos.row>=0 && pos.row<=7 && pos.col>=0 && pos.col<=7 && (check == false || ifCheck(piece,pos,moveHistory,state) == false)){
            moves.push(pos)
        }
        if(piece.pos.row == 1+index*5 && moves.find(move => move.row == piece.pos.row+1-index*2 && move.col == piece.pos.col)){
            pos = { row: piece.pos.row+2-index*4, col: piece.pos.col }
            if(state.find(p => checkPos(p.pos,pos)) == undefined && pos.row>=0 && pos.row<=7 && pos.col>=0 && pos.col<=7 && (check == false || ifCheck(piece,pos,moveHistory,state) == false)){
                moves.push(pos)
            }
        }
        pos = { row: piece.pos.row+1-index*2, col: piece.pos.col+1-index*2 }
        if(state.find(p => checkPos(p.pos,pos) && p.color != piece.color) && (check == false || ifCheck(piece,pos,moveHistory,state) == false)){
            moves.push(pos)
        }
        pos = { row: piece.pos.row+1-index*2, col: piece.pos.col-1+index*2 }
        if(state.find(p => checkPos(p.pos,pos) && p.color != piece.color) && (check == false || ifCheck(piece,pos,moveHistory,state) == false)){
            moves.push(pos)
        }
        if(moveHistory.length>0){
            const info = JSON.parse(moveHistory[moveHistory.length-1].piece)
            pos = { row: piece.pos.row+1-index*2, col: info.pos.col }
            if(piece.pos.row == 4-index && moveHistory[moveHistory.length-1].pos2.row == 4-index && info.name == 'Pawn' && info.pos.row == 6-index*5 && (check == false || ifCheck(piece,pos,moveHistory,state) == false)){
                moves.push(pos)
            }
        }
        return moves
    },
    'Rook': function(piece,state,moveHistory,check=true){
        const directions = [[1,0],[0,1],[-1,0],[0,-1]]
        const moves = []
        for(let i=0; i<directions.length; i++){
            for(let num=1; num<8; num++){
                const pos = { row: piece.pos.row+directions[i][0]*num, col: piece.pos.col+directions[i][1]*num}
                if(state.find(p => checkPos(p.pos,pos) && p.color == piece.color) || pos.row<0 || pos.row>7 || pos.col<0 || pos.col>7){ 
                    break
                }
                else{
                    if(check == false || ifCheck(piece,pos,moveHistory,state) == false){
                        if(state.find(p => checkPos(p.pos,pos))){
                            moves.push(pos)
                            break
                        }
                        moves.push(pos)
                    }
                }
            }
        }
        return moves
    },
}
class RecordMove{
    constructor(piece,pos2,state){
        this.piece = JSON.stringify(piece)
        this.pos2 = pos2
        this.state = JSON.stringify(state)
    }
}
const move = {
    'Queen': function(piece,movePos,state,moveHistory){
        moveHistory.push(new RecordMove(piece,movePos,state))
        const index = state.findIndex(p => p.pos.row == movePos.row && p.pos.col == movePos.col)
        if(index != -1){
            state.splice(index,1)
        }
        piece.pos = movePos
    },
    'King': function(piece,movePos,state,moveHistory){
        moveHistory.push(new RecordMove(piece,movePos,state))
        const index = state.findIndex(p => p.pos.row == movePos.row && p.pos.col == movePos.col)
        if(index != -1){
            state.splice(index,1)
        }
        if(Math.abs(movePos.col-piece.pos.col) == 2){
            if(movePos.col == 6){
                state.find(p => p.name == 'Rook' && p.color == piece.color && checkPos({row: ['black','white'].findIndex(c => c == piece.color)*7,col:7},p.pos)).pos = {row:['black','white'].findIndex(c => c == piece.color)*7,col:5}
            }
            else{
                state.find(p => p.name == 'Rook' && p.color == piece.color && checkPos({row: ['black','white'].findIndex(c => c == piece.color)*7,col:0},p.pos)).pos = {row:['black','white'].findIndex(c => c == piece.color)*7,col:3}
            }
        }
        piece.pos = movePos
    },
    'Knight': function(piece,movePos,state,moveHistory){
        moveHistory.push(new RecordMove(piece,movePos,state))
        const index = state.findIndex(p => p.pos.row == movePos.row && p.pos.col == movePos.col)
        if(index != -1){
            state.splice(index,1)
        }
        piece.pos = movePos
    },
    'Bishop': function(piece,movePos,state,moveHistory){
        moveHistory.push(new RecordMove(piece,movePos,state))
        const index = state.findIndex(p => p.pos.row == movePos.row && p.pos.col == movePos.col)
        if(index != -1){
            state.splice(index,1)
        }
        piece.pos = movePos
    },
    'Pawn': function(piece,movePos,state,moveHistory){
        moveHistory.push(new RecordMove(piece,movePos,state))
        let index = state.findIndex(p => p.pos.row == movePos.row && p.pos.col == movePos.col)
        if(index>=0){
            state.splice(index,1)
        }
        else if(movePos.col != piece.pos.col){
            index = state.findIndex(p => p.pos.row == piece.pos.row && p.pos.col == moveHistory[moveHistory.length-2].pos2.col)
            state.splice(index,1)
        }
        piece.pos = movePos
    },
    'Rook': function(piece,movePos,state,moveHistory){
        moveHistory.push(new RecordMove(piece,movePos,state))
        const index = state.findIndex(p => p.pos.row == movePos.row && p.pos.col == movePos.col)
        if(index != -1){
            state.splice(index,1)
        }
        piece.pos = movePos
    },
}
function ifCheck(piece,pos,moveHistory,state){
    const copyState = JSON.parse(JSON.stringify(state))
    const copyPiece = copyState.find(p => checkPos(p.pos,piece.pos))
    const copyMoveHistory = JSON.parse(JSON.stringify(moveHistory))
    copyMoveHistory.push(JSON.parse(JSON.stringify(new RecordMove(piece,pos,state))))
    const index = copyState.findIndex(p => checkPos(p.pos,pos))
    if(index>=0){
        copyState.splice(index,1)
    }
    copyState.find(p => checkPos(p.pos,piece.pos)).pos = pos
    const opPieces = copyState.filter(p => p.color != copyPiece.color)
    for(let i=0; i<opPieces.length; i++){
        const moves = pieceMoves[opPieces[i].name](opPieces[i],copyState,copyMoveHistory,false)
        if((moves.find(m => checkPos(m,pos)) && piece.name == 'King') || moves.find(m => checkPos(m,state.find(p => p.name == 'King' && p.color == piece.color).pos) && piece.name != 'King')){
            return true
        }
    }
    return false
}
export function getMoves(piece,state,moveHistory){
    return pieceMoves[piece.name](piece,state,moveHistory)
}
export function checkPos(pos1,pos2){
    if(pos1.row == pos2.row && pos1.col == pos2.col){
        return true
    }
    else{
        return false
    }
}
export function movePiece(piece,movePos,state,moveHistory){
    move[piece.name](piece,movePos,state,moveHistory)
}   