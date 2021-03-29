//import Typewriter from 'typewriter-effect/dist/core'
const Typewriter = require('typewriter-effect/dist/core')

window.addEventListener('DOMContentLoaded', () => {
    const cycleElement = document.getElementById('cycle')
    const text = ['Interactive Experiences', 'Functional Websites', 'Your Next Dream Project']
    const pauseBetween = 1000

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
})

export {}
