const runGame = (canvas: HTMLCanvasElement | null): void | null => {
    // Stop if we didn't get a canvas, or if it isn't supported
    if (!canvas || !canvas.getContext) return null

    // Testing...
    const ctx = canvas.getContext('2d')
    if (ctx !== null) {
        const resizeCanvas = (): void => {
            let width = document.getElementById('projects')?.clientWidth
            console.log(width)
            if (width) {
                ctx.canvas.height = 256
                ctx.canvas.width = width
                ctx.translate(width * .5, ctx.canvas.height * .5)
    
                ctx.scale(1, 1)
                ctx.fillStyle = '#fff'
                ctx.fillRect(0, 0, 10, 10)
            }
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
    }
    
}

export default runGame 
