import gameLoop from './gameLoop'

const runGame = (canvas: HTMLCanvasElement | null): void | null => {
    // Stop if we didn't get a canvas, or if it isn't supported
    if (!canvas || !canvas.getContext) return null

    const ctx = canvas.getContext('2d')
    if (ctx !== null) {
        const resizeCanvas = (): void => {
            let width = document.getElementById('projects')?.clientWidth
            if (width) {
                ctx.canvas.height = 256
                ctx.canvas.width = width
                ctx.translate(width * .5, ctx.canvas.height * .5)
            }
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        window.requestAnimationFrame(() => gameLoop(ctx))
    }
    
}

export default runGame 
