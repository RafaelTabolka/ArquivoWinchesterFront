document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;

        register(form);
    })

    async function register(form) {
        try {
            const formFields = [
                { name: 'hunterName' },
                { name: 'baseRegion' },
                { name: 'specialty' },
                { name: 'phone' },
                { name: 'password' },
                { name: 'confirmPassword' }
            ];

            let hasError = false;
            const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
            const regexPhone = /^\d{2}\s\d{4,5}[-]\d{4}$/;

            const clearSpan = form.querySelectorAll('.fieldset__span');

            clearSpan.forEach((e) => {
                e.classList.remove('fieldset__span--open');
            })

            formFields.forEach((field) => {
                const value = form[field.name].value.trim();

                if (value === '') {
                    const input = form.elements[field.name];
                    const element = input.closest('.fieldset__style-field');
                    const span = element.querySelector('.fieldset__span');
                    span.classList.add('fieldset__span--open');
                    hasError = true;
                }
            })

            if (!regexPassword.test(form.password.value.trim()) || form.password.value.trim() !== form.confirmPassword.value.trim()) {
                const spanPassword = form.querySelectorAll('.fieldset__span-password');
                spanPassword.forEach((e) => {
                    e.classList.add('fieldset__span--open');
                })
                hasError = true;
            }

            if (!regexPhone.test(form.phone.value.trim())) {
                const spanPhone = form.querySelector('.fieldset__span-phone');
                spanPhone.classList.add('fieldset__span--open');
                hasError = true;
            }

            if (hasError) {
                return;
            }

            const currentDate = new Date().toLocaleDateString('pt-BR');

            const newHunter = {
                hunterName: form.hunterName.value,
                password: form.password.value,
                createdAt: currentDate,
                baseRegion: form.baseRegion.value,
                specialty: form.specialty.value,
                phone: form.phone.value,
                notes: form.notes.value.trim()
            }

            const response = await fetch('http://localhost:3000/hunters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Este trecho faz o back-end entender que isso é um json
                },
                body: JSON.stringify(newHunter)
            });


            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const hunter = await response.json();

            sessionStorage.setItem('name', hunter.hunterName);

            window.location.href = '/pages/home/home.html';
        } catch (error) {
            console.log(error)
        }
    }
})