document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;

        login(form)
    })

    async function login(form) {
        try {
            const formFields = [
                { name: 'hunterName' },
                { name: 'password' }
            ];

            let hasError = false;

            const spanInputs = form.querySelectorAll('.section-container__span');

            spanInputs.forEach((e) => {
                e.classList.remove('section-container__span--open');
            })

            formFields.forEach((field) => {
                const value = form[field.name].value.trim();

                if (value === '') {
                    const input = form[field.name];
                    const element = input.closest('.section-container__style-field');
                    const span = element.querySelector('.section-container__span');
                    span.classList.add('section-container__span--open');
                    hasError = true;
                }
            })

            if (hasError) {
                return
            }

            const response = await fetch('http://localhost:3000/hunters');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const hunters = await response.json();

            const loggedHunter = hunters.find((hunter) => hunter.hunterName === form.hunterName.value && hunter.password === form.password.value);

            if (loggedHunter !== undefined) {
                sessionStorage.setItem('name', loggedHunter.hunterName);
                form.reset;
                window.location.href = '/pages/home/home.html';
            } else {
                alert('Acesso negado')
            }
        } catch (error) {
            console.log(error)
        }
    }
})