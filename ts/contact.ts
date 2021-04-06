// Handle the contact form
const contact = (): void => {
    const form = document.getElementById('contact-form') as HTMLFormElement

    if (!form) return

    form.addEventListener('submit', event => {
        event.preventDefault()

        const name = document.getElementById('name-input') as HTMLInputElement
        const email = document.getElementById('email-input') as HTMLInputElement
        const content = document.getElementById('content-input') as HTMLInputElement

        const nameError = document.getElementById('name-error') as HTMLInputElement
        const emailError = document.getElementById('email-error') as HTMLInputElement
        const contentError = document.getElementById('content-error') as HTMLInputElement
        const generalError = document.getElementById('general-error') as HTMLInputElement

        console.log(`${name.value} ${email.value} ${content.value}`)

        // Do frontend validation/handle error displaying
        let hasError = false
        let missingError = 'is required.'

        if (!name.value) {
            nameError.innerText = `Name ${missingError}`
            nameError.style.display = 'block'
            hasError = true
        }
        if (!email.value) {
            emailError.innerText = `E-Mail ${missingError}`
            emailError.style.display = 'block'
            hasError = true
        }
        if (!content.value) {
            contentError.innerText = `A message ${missingError}`
            contentError.style.display = 'block'
            hasError = true
        }

        if (!hasError) {
            fetch('https://portfolio-backend-one.vercel.app/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name: name.value,
                    email: email.value,
                    content: content.value 
                })
            })
            .then(response => response.json())
            .then(result => console.log(result))
            .catch(error => {
                console.error(error)
                generalError.innerText = `Looks like something went wrong serverside. We can still get in touch through other sites below.`
                generalError.style.display = 'block'
            })
        }
    })
}

export default contact
