function image(src){const img = new Image(); img.src = src; return img}
const images = {
    whitePawn: image('Images/wp.png'),
    whiteBishop: image('Images/wB.png'),
    whiteKing: image('Images/wK.png'),
    whiteKnight: image('Images/wN.png'),
    whiteRook: image('Images/wR.png'),
    whiteQueen: image('Images/wQ.png'),
    blackPawn: image('Images/bp.png'),
    blackBishop: image('Images/bB.png'),
    blackKing: image('Images/bK.png'),
    blackKnight: image('Images/bN.png'),
    blackRook: image('Images/bR.png'),
    blackQueen: image('Images/bQ.png')
}
const whitePawn = image('Images/wp.png')
const whiteBishop = image('Images/wB.png')
const whiteKing = image('Images/wK.png')
const whiteKnight = image('Images/wN.png')
const whiteRook = image('Images/wR.png')
const whiteQueen = image('Images/wQ.png')
const blackPawn = image('Images/bp.png')
const blackBishop = image('Images/bB.png')
const blackKing = image('Images/bK.png')
const blackKnight = image('Images/bN.png')
const blackRook = image('Images/bR.png')
const blackQueen = image('Images/bQ.png')
export function grabImage(name){
    return images[name]
}