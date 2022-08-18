const moveTypes = {
    'King': {directions:[[1,0],[0,1],[1,1],[-1,-1],[-1,0],[0,-1],[-1,1],[1,-1]],range:1},
    'Queen': {directions:[[1,0],[0,1],[1,1],[-1,-1],[-1,0],[0,-1],[-1,1],[1,-1]],range:8},
    'Bishop': {directions:[[1,1],[-1,-1],[-1,1],[1,-1]],range:8},
    'Knight': {directions:[[2,1],[1,2],[-1,-2],[-2,-1],[-2,1],[2,-1],[1,-2],[-1,2]],range:1},
    'Rook': {directions:[[1,0],[0,1],[-1,0],[0,-1]],range:8},
}
export function copyObject(object){
    const copy = {}
    for(const k in object){
        if(typeof(object[k]) == 'object'){
            if(Array.isArray(object[k])){
                copy[k] = copyArray(object[k])
            }
            else{
                copy[k] = copyObject(object[k])
            }
        }
        else{
            copy[k] = object[k]
        }
    }
    return copy
}
export function copyArray(array){
    const copy = []
    for(let i=0; i<array.length; i++){
        if(typeof(array[i]) == 'object'){
            if(Array.isArray(array[i])){
                copy.push(copyArray(array[i]))
            }
            else{
                copy.push(copyObject(array[i]))
            }
        }
        else{
            copy.push(array[i])
        }
    }
    return copy
}
export function checkPos(pos1,pos2){
    if(pos1.row == pos2.row && pos1.col == pos2.col){
        return true
    }
    return false
}
export function recordMove(piece,pos){
    return {piece: copyObject(piece), pos: copyObject(pos)}
}
export function getMoves(piece,state,moveHistory,check=true){
    const moves = []
    if(piece.name != 'Pawn'){
        const type = moveTypes[piece.name]
        for(let d=0; d<type.directions.length; d++){
            for(let i=1; i<type.range+1; i++){
                const pos = {row: piece.pos.row+type.directions[d][0]*i, col: piece.pos.col+type.directions[d][1]*i}
                if(pos.row>=0 && pos.row<=7 && pos.col>=0 && pos.col<=7){
                    if(state.find(p => checkPos(p.pos,pos)) == undefined){
                        if(check == false || ifCheck(piece,pos,state,moveHistory) == false){
                            moves.push(pos)
                        }
                    }
                    else{
                        if(state.find(p => checkPos(p.pos,pos) && p.color == piece.color) == undefined && (check == false || ifCheck(piece,pos,state,moveHistory) == false)){
                            moves.push(pos)
                        }
                        break
                    }
                }
            }
        }
        if(piece.name == 'King' && moveHistory.length>0 && moveHistory.find(m => m.piece.name == 'King' && m.piece.color == piece.color) == undefined && ifCheck(piece,piece.pos,state,moveHistory) == false){
            const index = ['black','white'].findIndex(c => c == piece.color)
            for(let i=0; i<2; i++){
                if(moveHistory.find(m => checkPos(m.piece.pos,{row:index*7,col:i*7})) == undefined){
                    if(state.find(p => checkPos(p.pos,{row:index*7,col:2}) || checkPos(p.pos,{row:index*7,col:3})) == undefined && (check == false || ifCheck(piece,{row:index*7,col:2},state,moveHistory) == false && ifCheck(piece,{row:index*7,col:3},state,moveHistory) == false) && i==0){
                        moves.push({row:index*7,col:2+i*4})
                    }
                    else if(state.find(p => checkPos(p.pos,{row:index*7,col:5}) || checkPos(p.pos,{row:index*7,col:6})) == undefined && (check == false || ifCheck(piece,{row:index*7,col:5},state,moveHistory) == false && ifCheck(piece,{row:index*7,col:6},state,moveHistory) == false) && i==1){
                        moves.push({row:index*7,col:2+i*4})
                    }
                }
            }
        }
    }
    else{
        const index = ['black','white'].findIndex(c => c == piece.color)
        let pos = {row:piece.pos.row+1-index*2,col:piece.pos.col}
        if(state.find(p => checkPos(p.pos,pos)) == undefined){
            if(check == false || ifCheck(piece,pos,state,moveHistory) == false){
                moves.push(pos)
            }
            pos = {row:piece.pos.row+2-index*4,col:piece.pos.col}
            if(piece.pos.row == 1+index*5 && state.find(p => checkPos(p.pos,pos)) == undefined){
                if(check == false || ifCheck(piece,pos,state,moveHistory) == false){
                    moves.push(pos)
                }
            }
        }
        for(let i=0; i<2; i++){
            pos = {row:piece.pos.row+1-index*2,col:piece.pos.col+1-i*2}
            if(state.find(p => checkPos(p.pos,pos) && p.color != piece.color)){
                if(check == false || ifCheck(piece,pos,state,moveHistory) == false){
                    moves.push(pos)
                }
            }
        }
        if(moveHistory.length>0){
            const info = moveHistory[moveHistory.length-1]
            if(piece.pos.row == 4-index && info.piece.name == 'Pawn' && info.piece.pos.row == 6-index*5 && info.pos.row == 4-index){
                if(check == false || ifCheck(piece,{row:piece.pos.row+1-index*2,col:info.piece.pos.col},state,moveHistory) == false){
                    moves.push({row:piece.pos.row+1-index*2,col:info.piece.pos.col})
                }
            }
        }
    }
    return moves
}
export function movePiece(piece,pos,state,moveHistory,animate=true){
    moveHistory.push(recordMove(piece,pos))
    const index = state.findIndex(p => checkPos(p.pos,pos))
    const i = ['black','white'].findIndex(c => c == piece.color)
    if(index>=0){
        state.splice(index,1)
    }
    else if(piece.name == 'Pawn' && piece.pos.col != pos.col){
        state.splice(state.findIndex(p => p.pos.row == piece.pos.row && p.pos.col == pos.col),1)
    }
    if(piece.name == 'King' && Math.abs(piece.pos.col-pos.col) == 2){
        const rook = state.find(p => checkPos(p.pos,{row:i*7,col:Math.round(pos.col/8)*7}))
        if(animate == true){
            rook.move({row:i*7,col:3+2*Math.round(pos.col/8)},state,[])
        }
    }
    if(animate == true && piece.name == 'Pawn' && pos.row == 7-i*7){
        piece.update('Queen')
    }
}
export function ifCheck(piece,pos,state,moveHistory){
    const copyState = copyArray(state)
    const copyMoveHistory = copyArray(moveHistory)
    const copyPiece = copyState.find(p => checkPos(p.pos,piece.pos))
    copyMoveHistory.push(recordMove(copyPiece,pos))
    const index = copyState.findIndex(p => checkPos(p.pos,pos) && checkPos(p.pos,piece.pos) == false)
    if(index>=0){
        copyState.splice(index,1)
    }
    else if(piece.name == 'Pawn' && piece.pos.col != pos.col){
        copyState.splice(copyState.findIndex(p => p.pos.row == piece.pos.row && p.pos.col == pos.col),1)
    }
    copyPiece.pos = pos
    const king = copyState.find(p => p.name == 'King' && p.color == piece.color)
    const opPieces = copyState.filter(p => p.color != piece.color)
    if(opPieces.find(p => {if(getMoves(p,copyState,copyMoveHistory,false).find(m => checkPos(m,king.pos))){return true}})){
        return true
    }
    else{
        return false
    }
}
export function ifCheckmate(color,state,moveHistory){
    const pieces = state.filter(p => p.color == color && getMoves(p,state,moveHistory).length>0)
    if(pieces.length == 0){
        return true
    }
    else{
        return false
    }
}
