import runGame from './game/main'
const Typewriter = require('typewriter-effect/dist/core')

window.addEventListener('DOMContentLoaded', () => {
    const setupTypewriter = (): void => {
        const cycleElement = document.getElementById('cycle')
        const text = ['Interactive Experiences', 'Functional Websites', 'Your Next Dream Project']
        const pauseBetween = 1500
    
        const typewriter = new Typewriter(cycleElement, {
            loop: true,
            delay: 75,
            deleteSpeed: 25
        })
    
        typewriter
            .pauseFor(pauseBetween)
            .typeString(text[0])
            .pauseFor(pauseBetween * 2)
            .deleteChars(text[0].length)
            .pauseFor(pauseBetween)
            .typeString(text[1])
            .pauseFor(pauseBetween * 2)
            .deleteChars(text[1].length)
            .pauseFor(pauseBetween)
            .typeString(text[2])
            .pauseFor(pauseBetween * 2)
            .deleteChars(text[2].length)
            .pauseFor(pauseBetween)
            .start()
    }
    setupTypewriter()

    // Unhide js-only content
    const jsOnly = document.getElementsByClassName('js-only')
    for (let i = 0; i < jsOnly.length; i++) {
        jsOnly[i].classList.remove('js-only')
    }
    
    runGame(document.getElementById('game') as HTMLCanvasElement)
})

export {}
