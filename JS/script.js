import { grabImage } from "./images.js"
import { getMoves, checkPos, movePiece, ifCheckmate, RecordMove } from "./pieceMoves.js"
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.height = window.document.defaultView.innerHeight-20
canvas.width = window.document.defaultView.innerWidth-20
const cooldown = 100
function size(){
    let length;
    if(canvas.width>canvas.height){
        length = canvas.height
        if(canvas.width-canvas.height<200){
            length = canvas.width-200
        }
    }
    else{
        length = canvas.width
        if(canvas.height-canvas.width<200){
            length = canvas.height-200
        }
    }
    if(length<400){
        length = 400
    }
    return length
}
const pieceValues = {
    'Pawn': 1,
    'Queen': 9,
    'King': 10,
    'Rook': 5,
    'Knight': 3,
    'Bishop': 3
}
class Piece{
    constructor(color,name,pos){
        this.color = color
        this.name = name
        this.pos = pos
        this.img = grabImage(color+name)
        this.value = pieceValues[name]
    }
    draw(x,y,w,h){
        ctx.drawImage(this.img,x+this.pos.col*w/8,y+this.pos.row*h/8,w/8,h/8)
    }
    updatePiece(name){
        this.img = grabImage(this.color+name)
        this.value = pieceValues[name]
    }
}
class ChessBoard{
    constructor(x,y,w,h){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.turn = 'white'
        this.pieces = this.boardSetup()
        this.selectedPiece = undefined
        this.moveHistory = []
        //setTimeout(() => {bot2.play(this.pieces,this.moveHistory)},cooldown)
    }
    draw(){
        const oddNums = [1,3,5,7,9,11,13,15]
        for(let row=0; row<8; row++){
            for(let col=0; col<8; col++){
                if(oddNums.find(num => num == row+col) != undefined){
                    ctx.fillStyle = 'brown'
                }
                else{
                    ctx.fillStyle = 'beige'
                }
                ctx.fillRect(this.x+col*this.w/8,this.y+row*this.h/8,this.w/8,this.h/8)
            }
        }
        for(let i=0; i<this.pieces.length; i++){
            this.pieces[i].draw(this.x,this.y,this.w,this.h)
        }
        if(this.selectedPiece != undefined){
            const moves = getMoves(this.selectedPiece,this.pieces,this.moveHistory)
            for(let i=0; i<moves.length; i++){
                if(this.pieces.find(p => checkPos(p.pos,moves[i]) && p != this.selectedPiece) || (this.selectedPiece.name == 'Pawn' && moves[i].col != this.selectedPiece.pos.col)){
                    ctx.fillStyle = '#ff0000'
                }
                else{
                    ctx.fillStyle = '#00ff00'
                }
                ctx.beginPath()
                ctx.arc(this.x+moves[i].col*this.w/8+this.w/16,this.y+moves[i].row*this.h/8+this.h/16,this.w/64,0,Math.PI*2,false)
                ctx.fill()
            }
        }
    }
    boardSetup(){
        const pieces = []
        const colors = ['black','white']
        const pieceNames = ['Rook','Knight','Bishop']
        for(let color=0; color<2; color++){
            pieces.push(new Piece(colors[color],'Queen',{row: color*7, col: 3}))
            pieces.push(new Piece(colors[color],'King',{row: color*7, col: 4}))
            for(let col=0; col<2; col++){
                for(let name=0; name<pieceNames.length; name++){
                    pieces.push(new Piece(colors[color],pieceNames[name],{row: color*7, col: name+col*(7-name*2)}))
                }
            }
        }
        for(let col=0; col<8; col++){
            pieces.push(new Piece('black','Pawn',{row: 1, col: col}))
            pieces.push(new Piece('white','Pawn',{row: 6, col: col}))
        }
        return pieces
    }
    update(){
        this.x = size()/16
        this.y = size()/16
        this.w = size()*0.875
        this.h = size()*0.875
    }
    getPos(x,y){
        for(let row=0; row<8; row++){
            for(let col=0; col<8; col++){
                if(x>=this.x+col*this.w/8 && x<=this.x+(col+1)*this.w/8 && y>=this.y+row*this.h/8 && y<=this.y+(row+1)*this.h/8){
                    return { row: row, col: col }
                }
            }
        }
        return { row: 100, col: 100 }
    }
    wasClicked(e){
        if(e.which == undefined || this.turn == 'white'){
            const x = e.pageX-10
            const y = e.pageY-10
            const pos = this.getPos(x,y)
            if(this.selectedPiece != undefined){
                const moves = getMoves(this.selectedPiece,this.pieces,this.moveHistory)
                if(moves.find(move => checkPos(move,pos))){
                    if(this.turn == 'black'){
                        this.turn = 'white'
                        //setTimeout(() => {bot2.play(this.pieces,this.moveHistory)},cooldown)
                    }
                    else{
                        this.turn = 'black'
                        setTimeout(() => {bot1.play(this.pieces,this.moveHistory)},cooldown)
                    }
                    movePiece(this.selectedPiece,pos,this.pieces,this.moveHistory)
                    this.selectedPiece = undefined
                    const checkmate = ifCheckmate(this.pieces,this.moveHistory,this.turn)
                    if(checkmate == true){
                        setTimeout(() => {alert(['white','black'].find(c => c != this.turn)+' wins!')},100)
                    }
                }
                else{
                    this.selectedPiece = this.pieces.find(p => checkPos(pos,p.pos) && p.color == this.turn)
                }
            }
            else{
                this.selectedPiece = this.pieces.find(p => p.color == this.turn && checkPos(pos,p.pos))
            }
        }
    }
}
class Bot{
    constructor(color){
        this.color = color
    }
    play(state,moveHistory){
        let moved = false
        const pieces = state.filter(p => p.color == this.color)
        const movablePieces = []
        const { x:x, y:y, w:w, h:h } = chessBoard
        loop:
        for(let i=0; i<pieces.length; i++){
            const moves = getMoves(pieces[i],state,moveHistory)
            if(moves.length>0){
                movablePieces.push(pieces[i])
            }
            for(let m=0; m<moves.length; m++){
                const copyState = JSON.parse(JSON.stringify(state))
                const copyMoveHistory = JSON.parse(JSON.stringify(moveHistory))
                copyMoveHistory.push(JSON.parse(JSON.stringify(new RecordMove(pieces[i],moves[m],state))))
                const index = copyState.findIndex(p => checkPos(p.pos,moves[m]))
                if(index>=0){
                    copyState.splice(index,1)
                }
                copyState.find(p => checkPos(p.pos,pieces[i].pos)).pos = moves[m]
                const checkmate = ifCheckmate(copyState,copyMoveHistory,['white','black'].find(c => c != this.color))
                if(checkmate == true){
                    let e = { pageX: pieces[i].pos.col*w/8+x+10+w/16, pageY: pieces[i].pos.row*h/8+y+10+h/16 }
                    chessBoard.wasClicked(e)
                    setTimeout(() => {
                        e = { pageX: moves[m].col*w/8+x+10+w/16, pageY: moves[m].row*h/8+y+10+h/16 }
                        chessBoard.wasClicked(e)
                    },cooldown)
                    moved = true
                    break loop
                }
            }
        }
        if(moved == false && ifCheckmate(state,moveHistory,this.color) == false){
            const difs = []
            const takeMoves = []
            movablePieces.filter(m => getMoves(m,state,moveHistory).filter(p => state.filter(t => {if(checkPos(t.pos,p) && this.notTrap(t,p,state,moveHistory)){takeMoves.push([m,t])}})))
            for(let i=0; i<takeMoves.length; i++){
                const copyState = JSON.parse(JSON.stringify(state))
                const index = copyState.findIndex(p => checkPos(p.pos,takeMoves[i][1].pos))
                if(index>=0){
                    copyState.splice(index,1)
                }
                copyState.find(p => checkPos(p.pos,takeMoves[i][0].pos)).pos = takeMoves[i][1].pos
                const opPieces = copyState.filter(p => p.color != this.color)
                const copyMoveHistory = JSON.parse(JSON.stringify(moveHistory))
                copyMoveHistory.push(new RecordMove(takeMoves[i][0],takeMoves[i][1].pos,copyState))
                if(opPieces.find(p => getMoves(p,copyState,copyMoveHistory).find(m => checkPos(m,takeMoves[i][1].pos)))){
                    difs.push(takeMoves[i][1].value-takeMoves[i][0].value)
                }
                else{
                    difs.push(takeMoves[i][1].value)
                }
            }
            const index = difs.findIndex(d => d == Math.max(...difs))
            const info = takeMoves[index]
            if(Math.max(...difs)>=0){
                let e = {pageX:x+10+w/16+info[0].pos.col*w/8,pageY:y+10+h/16+info[0].pos.row*h/8}
                chessBoard.wasClicked(e)
                setTimeout(() => {
                    e = {pageX:x+10+w/16+info[1].pos.col*w/8,pageY:y+10+h/16+info[1].pos.row*h/8}
                    chessBoard.wasClicked(e)
                },cooldown)
                moved = true
            }
            else{
                const pawns = state.filter(p => p.name == 'Pawn' && p.color == this.color && p.pos.row == 3+['white','black'].findIndex(c => c == this.color))
                for(let i=0; i<pawns.length; i++){
                    const pos = getMoves(pawns[i],state,moveHistory).find(m => m.col != pawns[i].pos.col)
                    if(pos != undefined && this.notTrap(pawns[i],pos,state,moveHistory)){
                        let e = {pageX:x+10+w/16+pawns[i].pos.col*w/8,pageY:y+10+h/16+pawns[i].pos.row*h/8}
                        chessBoard.wasClicked(e)
                        setTimeout(() => {
                            e = {pageX:x+10+w/16+pos.col*w/8,pageY:y+10+h/16+pos.row*h/8}
                            chessBoard.wasClicked(e)
                        },cooldown)
                        moved = true
                        break
                    }
                }
            }
        }
        if(moved == false && ifCheckmate(state,moveHistory,this.color) == false){
            const ms = []
            for(let i=0; i<movablePieces.length; i++){
                const moves = getMoves(movablePieces[i],state,moveHistory)
                for(let r=0; r<moves.length; r++){
                    if(this.notTrap(movablePieces[i],moves[r],state,moveHistory)){
                        ms.push([movablePieces[i],moves[r]])
                    }
                }
            }
            if(ms.length == 0){
                const piece = movablePieces[Math.round(Math.random()*(movablePieces.length-1))]
                const move = getMoves(piece,state,moveHistory)[Math.floor(Math.random()*getMoves(piece,state,moveHistory).length)]
                let e = { pageX: piece.pos.col*w/8+x+10+w/16, pageY: piece.pos.row*h/8+y+10+h/16 }
                chessBoard.wasClicked(e)
                setTimeout(() => {
                    e = { pageX: move.col*w/8+x+10+w/16, pageY: move.row*h/8+y+10+h/16 }
                    chessBoard.wasClicked(e)
                },cooldown)
            }
            else{
                const chosen = ms[Math.round(Math.random()*(ms.length-1))]
                const piece = chosen[0]
                const move = chosen[1]
                let e = { pageX: piece.pos.col*w/8+x+10+w/16, pageY: piece.pos.row*h/8+y+10+h/16 }
                chessBoard.wasClicked(e)
                setTimeout(() => {
                    e = { pageX: move.col*w/8+x+10+w/16, pageY: move.row*h/8+y+10+h/16 }
                    chessBoard.wasClicked(e)
                },cooldown)
                console.log(getMoves(piece,state,moveHistory))
            }
        }
    }
    notTrap(piece,move,state,moveHistory){
        const copyState = JSON.parse(JSON.stringify(state))
        const copyMoveHistory = JSON.parse(JSON.stringify(moveHistory))
        copyState.find(p => checkPos(p.pos,piece.pos)).pos = move
        copyMoveHistory.push(new RecordMove(piece,move,state))
        const opPieces = copyState.filter(p => p.color != this.color)
        for(let i=0; i<opPieces.length; i++){
            const moves = getMoves(opPieces[i],copyState,copyMoveHistory)
            for(let r=0; r<moves.length; r++){
                const copyS = JSON.parse(JSON.stringify(copyState))
                const copyM = JSON.parse(JSON.stringify(copyMoveHistory))
                copyS.find(p => checkPos(p.pos,opPieces[i].pos)).pos = moves[r]
                copyM.push(new RecordMove(opPieces[i],moves[r],copyS))
                if(ifCheckmate(copyS,copyM,this.color) == true){
                    return false
                }
            }
        }
        return true
    }
}
const chessBoard = new ChessBoard(size()/16,size()/16,size()*0.875,size()*0.875)
const bot1 = new Bot('black')
const bot2 = new Bot('white')
function mainLoop(){
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,900,1200)
    chessBoard.draw()
    requestAnimationFrame(mainLoop)
}
mainLoop()
window.addEventListener('resize',function(e){
    canvas.height = e.currentTarget.innerHeight-20
    canvas.width = e.currentTarget.innerWidth-20
    chessBoard.update()
})
window.addEventListener('mousedown',function(e){
    chessBoard.wasClicked(e)
})
