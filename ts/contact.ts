// Handle the contact form
const contact = (): void => {
    const form = document.getElementById('contact-form') as HTMLFormElement

    if (!form) return

    form.addEventListener('submit', event => {
        event.preventDefault()

        const success = document.getElementById('general-success') as HTMLElement
        const button = document.getElementById('send') as HTMLButtonElement

        const name = document.getElementById('name-input') as HTMLInputElement
        const email = document.getElementById('email-input') as HTMLInputElement
        const content = document.getElementById('content-input') as HTMLInputElement

        const nameError = document.getElementById('name-error') as HTMLInputElement
        const emailError = document.getElementById('email-error') as HTMLInputElement
        const contentError = document.getElementById('content-error') as HTMLInputElement
        const generalError = document.getElementById('general-error') as HTMLInputElement

        console.log(`${name.value} ${email.value} ${content.value}`)

        // Clear previous messages
        nameError.style.display = 'none'
        emailError.style.display = 'none'
        contentError.style.display = 'none'
        success.style.display = 'none'

        // Do frontend validation/handle error displaying
        let hasError = false
        let missingError = 'is required.'

        if (!name.value) {
            nameError.innerText = `Name ${missingError}`
            nameError.style.display = 'block'
            hasError = true
        }

        const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/
        if (!emailRegex.test(email.value)) {
            emailError.innerText = 'Invalid e-mail.'
            emailError.style.display = 'block'
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
            button.innerText = 'Sending...'
            button.disabled = true

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
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Status ${response.status}`)
                }
                return response.json()
            })
            .then(result => {
                console.log(result)
                // Show success
                generalError.style.display = 'none'
                success.innerText = 'Message successfully sent!'
                success.style.display = 'block'
                // Clear inputs
                name.value = ''
                email.value = ''
                content.value = ''
            })
            .catch(error => {
                console.error(`Error: ${JSON.stringify(error)}`)
                generalError.innerText = `Looks like something went wrong serverside.`
                generalError.style.display = 'block'
            })
            .finally(() => {
                // Change button
                button.innerText = 'Send Message'
                button.disabled = false
            })
        }
    })
}

export default contact
