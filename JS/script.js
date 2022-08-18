import { grabImage } from "./images.js"
import { copyObject, getMoves, copyArray, movePiece, checkPos, ifCheck, ifCheckmate , recordMove } from "./pieceMoves.js"
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.height = window.document.defaultView.innerHeight-20
canvas.width = window.document.defaultView.innerWidth-20
const values = {
    'Pawn': 1,
    'Knight': 3,
    'Bishop': 3,
    'Rook': 5,
    'Queen': 9,
    'King': 10
}
class Piece{
    constructor(color,name,pos){
        this.color = color
        this.name = name
        this.pos = pos
        this.value = values[name]
    }
    draw(margin,size){
        ctx.drawImage(grabImage(this.color+this.name),margin+this.pos.col*size/8,margin+this.pos.row*size/8,size/8,size/8)
    }
    update(name){
        this.name = name
    }
    moves(state,moveHistory){
        return getMoves(this,state,moveHistory)
    }
    move(pos,state,moveHistory){
        movePiece(this,pos,state,moveHistory)
        this.moving = true
        for(let i=0; i<50; i++){
            setTimeout(() => {
                this.pos.row += (pos.row-this.pos.row)/200*i
                this.pos.col += (pos.col-this.pos.col)/200*i
            },i*10)
        }
        setTimeout(() => {
            this.pos = pos
            this.moving = false
        },500)
    }
}
class Chessboard{
    constructor(){
        this.updateSize()
        this.setup()
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
                ctx.fillRect(this.margin+col*this.size/8,this.margin+row*this.size/8,this.size/8,this.size/8)
            }
        }
        ctx.lineWidth = 2
        ctx.strokeRect(this.margin-1,this.margin-1,this.size+2,this.size+2)
        const king = this.pieces.find(p => p.color == this.turn && p.name == 'King')
        if(ifCheck(king,king.pos,this.pieces,this.moveHistory) && this.pieces.find(p => p.moving == true) == undefined){
            const pos = this.convertPos(king.pos)
            pos.x -= this.size/16
            pos.y -= this.size/16
            ctx.fillStyle = '#ff0000'
            ctx.fillRect(pos.x,pos.y,this.size/8,this.size/8)
        }
        this.pieces.forEach(p => p.draw(this.margin,this.size))
        if(this.selectedPiece != undefined && chessboard.turn == 'white'){
            const moves = this.selectedPiece.moves(this.pieces,this.moveHistory)
            for(let i=0; i<moves.length; i++){
                const pos = this.convertPos(moves[i])
                if(this.pieces.find(p => checkPos(p.pos,moves[i])) != undefined || (this.selectedPiece.name == 'Pawn' && moves[i].col != this.selectedPiece.pos.col)){
                    ctx.fillStyle = '#ff0000'
                }
                else{
                    ctx.fillStyle = '#00ff00'
                }
                ctx.beginPath()
                ctx.arc(pos.x,pos.y,this.size/64,0,Math.PI*2,false)
                ctx.fill()
            }
        }
    }
    updateSize(){
        this.size = Math.min(...[canvas.width,canvas.height])*0.875
        this.margin = this.size/14
    }
    setup(){
        this.pieces = []
        this.turn = 'white'
        this.moveHistory = []
        const colors = ['black','white']
        for(let i=0; i<colors.length; i++){
            for(let p=0; p<8; p++){
                this.pieces.push(new Piece(colors[i],'Pawn',{row:1+i*5,col:p}))
            }
            for(let p=0; p<2; p++){
                this.pieces.push(new Piece(colors[i],'Rook',{row:i*7,col:p*7}))
                this.pieces.push(new Piece(colors[i],'Knight',{row:i*7,col:1+p*5}))
                this.pieces.push(new Piece(colors[i],'Bishop',{row:i*7,col:2+p*3}))
            }
            this.pieces.push(new Piece(colors[i],'Queen',{row:i*7,col:3}))
            this.pieces.push(new Piece(colors[i],'King',{row:i*7,col:4}))
        }
    }
    wasClicked(e){
        const x = e.pageX-10
        const y = e.pageY-10
        if(this.selectedPiece == undefined){
            this.selectedPiece = this.pieces.find(p => checkPos(p.pos,this.convertPos({x:x,y:y})) && p.color == this.turn)
        }
        else{
            const moves = this.selectedPiece.moves(this.pieces,this.moveHistory)
            const pos = this.convertPos({x:x,y:y})
            if(moves.find(m => checkPos(m,pos)) != undefined){
                this.selectedPiece.move(pos,this.pieces,this.moveHistory)
                this.selectedPiece = undefined
                this.turn = ['white','black'].find(c => c != this.turn)
                if(this.turn == 'black'){
                    setTimeout(() => {
                        bot.play(this.pieces,this.moveHistory)
                    },750)
                }
                setTimeout(() => {
                    if(ifCheckmate(this.turn,this.pieces,this.moveHistory)){
                        alert(['white','black'].find(c => c != this.turn)+' wins!')
                    }
                },500)
            }
            else{
                this.selectedPiece = this.pieces.find(p => checkPos(p.pos,this.convertPos({x:x,y:y})) && p.color == this.turn)
            }
        }
    }
    convertPos(pos){
        if(pos.row != undefined){
            return {x: this.margin+pos.col*this.size/8+this.size/16, y:this.margin+pos.row*this.size/8+this.size/16}
        }
        else{
            const x = pos.x-this.margin
            const y = pos.y-this.margin
            if(x>=0 && x<=this.size && y>=0 && y<=this.size){
                return {row: Math.floor((y/this.size)*8), col: Math.floor((x/this.size)*8)}
            }
            else{
                return {row:100,col:100}
            }
        }
    }
}
class Bot{
    constructor(color){
        this.color = color
    }
    play(state,moveHistory){
        if(ifCheckmate(this.color,state,moveHistory) == false){
            const pieces = state.filter(p => p.color == this.color && p.moves(state,moveHistory).length>0)
            const mate = this.findMateIn1(this.color,pieces,state,moveHistory)
            let piece = mate.piece
            let move = mate.move
            if(piece == undefined){
                const moves = this.avoidMate(pieces,state,moveHistory)
                if(moves.length==0){
                    piece = pieces[Math.round(Math.random()*(pieces.length-1))]
                    move = piece.moves(state,moveHistory)[Math.round(Math.random()*(piece.moves(state,moveHistory).length-1))]
                }
                else{
                    const exchange = this.findEchange(moves,state,moveHistory)
                    if(exchange != undefined){
                        piece = exchange[0]
                        move = exchange[1]
                    }
                    else{
                        const chosen = moves[Math.round(Math.random()*(moves.length-1))]
                        piece = chosen[0]
                        move = chosen[1]
                    }
                }
            }
            let pos = chessboard.convertPos(piece.pos)
            chessboard.wasClicked({pageX:pos.x,pageY:pos.y})
            pos = chessboard.convertPos(move)
            chessboard.wasClicked({pageX:pos.x,pageY:pos.y})
        }
    }
    findMateIn1(color,pieces,state,moveHistory){
        for(let i=0; i<pieces.length; i++){
            const moves = getMoves(pieces[i],state,moveHistory)
            for(let m=0; m<moves.length; m++){
                const copyState = copyArray(state)
                const copyMoveHistory = copyArray(moveHistory)
                const copyPiece = copyState.find(p => checkPos(p.pos,pieces[i].pos))
                movePiece(copyPiece,moves[m],copyState,copyMoveHistory,false)
                copyPiece.pos = moves[m]
                if(ifCheckmate(['white','black'].find(c => c != color),copyState,copyMoveHistory)){
                    return {piece:pieces[i],move:moves[m]}
                }
            }
        }
        return {piece:undefined,move:undefined}
    }
    avoidMate(pieces,state,moveHistory){
        const possibleMoves = []
        for(let i=0; i<pieces.length; i++){
            const moves = pieces[i].moves(state,moveHistory)
            for(let m=0; m<moves.length; m++){
                const copyState = copyArray(state)
                const copyMoveHistory = copyArray(moveHistory)
                const copyPiece = copyState.find(p => checkPos(p.pos,pieces[i].pos))
                movePiece(copyPiece,moves[m],copyState,copyMoveHistory,false)
                copyPiece.pos = moves[m]
                if(this.findMateIn1(['white','black'].find(c => c != this.color),copyState.filter(p => p.color != this.color && getMoves(p,copyState,copyMoveHistory).length>0),copyState,copyMoveHistory).piece == undefined){
                    possibleMoves.push([pieces[i],moves[m]])
                }
            }
        }
        return possibleMoves
    }
    findEchange(moves,state,moveHistory){
        const exchanges = []
        const difs = []
        for(let i=0; i<moves.length; i++){
            const copyState = copyArray(state)
            const copyMoveHistory = copyArray(moveHistory)
            const copyPiece = copyState.find(p => checkPos(p.pos,moves[i][0].pos))
            const op = copyState.find(p => checkPos(p.pos,moves[i][1]))
            if(op != undefined){
                const value = op.value
                movePiece(copyPiece,moves[i][1],copyState,copyMoveHistory,false)
                copyPiece.pos = moves[i][1]
                if(copyState.find(p => p.color != this.color && getMoves(p,copyState,copyMoveHistory).find(m => checkPos(m,copyPiece.pos)) != undefined) == undefined){
                    exchanges.push(moves[i])
                    difs.push(value)
                }
            }
        }
        if(difs.length>0){
            return exchanges[difs.findIndex(d => d == Math.max(...difs))]
        }
        else{
            return undefined
        }
    }
}
const bot = new Bot('black')
const chessboard = new Chessboard()
function mainLoop(){
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    chessboard.draw()
    requestAnimationFrame(mainLoop)
}
mainLoop()
window.addEventListener('resize',function(e){
    canvas.height = e.currentTarget.innerHeight-20
    canvas.width = e.currentTarget.innerWidth-20
    chessboard.updateSize()
})
window.addEventListener('mousedown',function(e){
    if(chessboard.pieces.find(p => p.moving == true) == undefined && chessboard.turn == 'white'){
        chessboard.wasClicked(e)
    }
})
