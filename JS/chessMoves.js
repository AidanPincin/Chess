export function comparePos(pos1,pos2){
    if(pos1.row == pos2.row && pos1.col == pos2.col){
        return true
    }
}
const moves = {
    'commonPiece':function(pdirections,piece,state){
        const directions = pdirections
        const legalMoves = []
        for(let i=0; i<directions.length; i++){
            loop:for(let d=1; d<8; d++){
                const move = {
                    row: piece.pos.row+directions[i][0]*d,
                    col: piece.pos.col+directions[i][1]*d
                }
                const occupyingPiece = state.find(p => comparePos(p.pos,move))
                if(occupyingPiece != undefined){
                    if(occupyingPiece.color != piece.color){
                        legalMoves.push(move)
                    }
                    break loop
                }
                else if(move.row<0 || move.row>7 || move.col<0 || move.col>7){
                    break loop
                }
                else{
                    legalMoves.push(move)
                }
            }
        }
        return legalMoves
    },
    'uncommonPiece':function(pdirections,piece,state){
        const directions = pdirections
        const legalMoves = []
        for(let i=0; i<directions.length; i++){
            const move = {
                row: piece.pos.row+directions[i][0],
                col: piece.pos.col+directions[i][1]
            }
            if(state.find(p => comparePos(p.pos,move) && p.color == piece.color) == undefined && move.row>=0 && move.row<=7 && move.col>=0 && move.col<=7){
                legalMoves.push(move)
            }
        }
        return legalMoves
    },
    'Queen':function(piece,state){
        return moves['commonPiece']([[1,1],[-1,-1],[-1,1],[1,-1],[0,-1],[0,1],[1,0],[-1,0]],piece,state)
    },
    'Bishop':function(piece,state){
        return moves['commonPiece']([[1,1],[-1,-1],[-1,1],[1,-1]],piece,state)
    },
    'Rook':function(piece,state){
        return moves['commonPiece']([[1,0],[0,-1],[0,1],[-1,0]],piece,state)
    },
    'Knight':function(piece,state){
        return moves['uncommonPiece']([[2,1],[1,2],[-1,2],[1,-2],[-2,1],[2,-1],[-2,-1],[-1,-2]],piece,state)
    },
    'King':function(piece,state){
        return moves['uncommonPiece']([[1,1],[-1,-1],[-1,1],[1,-1],[0,-1],[0,1],[1,0],[-1,0]],piece,state)
    },
    'Pawn':function(piece,state){
        const legalMoves = []
        let directions = []
        if(piece.color == 'white'){
            directions = [[0,1],[0,2],[-1,1],[1,1]]
        }
        else{
            directions = [[0,-1],[0,-2],[-1,-1],[1,-1]]
        }
        for(let i=0; i<4; i++){
            const move = {
                col: piece.pos.col+directions[i][0],
                row: piece.pos.row+directions[i][1]
            }
            const occupyingPiece = state.find(p => comparePos(p.pos,move))
            if(occupyingPiece == undefined){
                if(i==0){
                    legalMoves.push(move)
                }
                if(i==1 && legalMoves.length==1 && (piece.pos.row == 1 || piece.pos.row == 6) && move.row>=0 && move.row<=7){
                    legalMoves.push(move)
                }
            }
            else if(i>1 && occupyingPiece.color != piece.color){
                legalMoves.push(move)
            }
        }
        if(piece.enpessant != undefined){
            legalMoves.push(piece.enpessant)
        }
        return legalMoves
    }
}
export function copy(val){
    if(Array.isArray(val)){
        const copyArray = []
        for(const [i,v] of val.entries())
        copyArray[i] = copy(v)
        return copyArray
    }
    else if(typeof val == 'object'){
        const copyObject = {}
        for (const [i, v] of Object.entries(val))
        copyObject[i] = copy(v)
        return copyObject
    }
    else{
        return val
    }
}
export function saveState(state,changes=[]){
    const copyState = copy(state)
    for(let i=0; i<changes.length; i++){
        const index = copyState.findIndex(p => comparePos(p.pos,changes[i][1]))
        if(index != -1){
            copyState.splice(index,1)
        }
        else if(changes[i][0].name == 'Pawn' && changes[i][1].col != changes[i][0].pos.col){
            copyState.splice(copyState.findIndex(p => p.pos.col == changes[i][1].col && p.pos.row == changes[i][0].pos.row),1)
        }
        const piece = copyState.find(p => comparePos(p.pos,changes[i][0].pos))
        piece.pos = changes[i][1]
        if(piece.name == 'Pawn' && (piece.pos.row == 0 || piece.pos.row == 7)){
            piece.name = 'Queen'
        }
    }
    return copyState
}
export function getMoves(piece,state,isChecking=true){
    if(isChecking == false){
        return moves[piece.name](piece,state)
    }
    const validMoves = moves[piece.name](piece,state)
    if(piece.name == 'King' && piece.moved != true && check(piece.color,state) == false){
        const row = ['white','black'].findIndex(c => c == piece.color)*7
        if(!state.find(p => p.pos.row == row && (p.pos.col == 1 || p.pos.col == 2)) && state.find(p => p.name == 'Rook' && !p.moved && comparePos({row:row,col:0},p.pos))){
            if(check(piece.color,saveState(state,[[piece,{row:row,col:2}]])) == false){
                validMoves.push({row:row,col:1})
            }
        }
        if(!state.find(p => p.pos.row == row && (p.pos.col == 6 || p.pos.col == 5 || p.pos.col == 4)) && state.find(p => p.name == 'Rook' && !p.moved && comparePos({row:row,col:7},p.pos))){
            if(check(piece.color,saveState(state,[[piece,{row:row,col:4}]])) == false){
                validMoves.push({row:row,col:5})
            }
        }
    }
    const legalMoves = []
    for(let i=0; i<validMoves.length; i++){
        if(check(piece.color,saveState(state,[[piece,validMoves[i]]])) == false){
            legalMoves.push(validMoves[i])
        }
    }
    return legalMoves
}
export function check(color,state){
    const king = state.find(p => p.name == 'King' && p.color == color)
    const enemyPieces = state.filter(p => p.color != color)
    for(let i=0; i<enemyPieces.length; i++){
        const moves = getMoves(enemyPieces[i],state,false)
        if(moves.find(m => comparePos(m,king.pos))){
            return true
        }
    }
    return false
}
export function checkmate(color,state){
    const pieces = state.filter(p => p.color == color)
    for(let i=0; i<pieces.length; i++){
        if(getMoves(pieces[i],state).length>0){
            return false
        }
    }
    if(check(color,state)){
        return true
    }
    return false
}
