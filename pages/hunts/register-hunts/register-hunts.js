document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            const form = event.target;

            const formFields = [
                { name: 'title' },
                { name: 'status' },
                { name: 'difficulty' },
                { name: 'city' },
                { name: 'uf' },
                { name: 'entity' },
                { name: 'latitude' },
                { name: 'longitude' },
                { name: 'date' },
                { name: 'summary' }
            ]

            let hasError = false;
            // const regexUf = /^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/

            const clearSpan = form.querySelectorAll('.fieldset__span');

            clearSpan.forEach((e) => {
                e.classList.remove('fieldset__span--open');
            })

            formFields.forEach((field) => {
                const value = form[field.name].value.trim();

                if (value === '') {
                    const input = form[field.name];
                    const element = input.closest('.fieldset__style-field');
                    const span = element.querySelector('.fieldset__span');
                    span.classList.add('fieldset__span--open');
                    hasError = true;
                }
            })

            // if (!regexUf.test(form.uf.value.toUpperCase())) {
            //     const spanEntity = form.querySelector('.fieldset__span-uf');
            //     spanEntity.classList.add('fieldset__span--open');
            //     hasError = true;
            // }

            const latitude = Number(form.latitude.value.trim().replace(',', '.'));
            const longitude = Number(form.longitude.value.trim().replace(',', '.'));

            if (latitude < -90 || latitude > 90 || Number.isNaN(latitude)) {
                const spanLatitude = form.querySelector('.fieldset__span-latitude');
                spanLatitude.classList.add('fieldset__span--open');

                hasError = true;
            }

            if (longitude < -180 || longitude > 180 || Number.isNaN(longitude)) {

                const spanLongitude = form.querySelector('.fieldset__span-longitude');
                spanLongitude.classList.add('fieldset__span--open');
                hasError = true;
            }


            if (hasError) {
                return;
            }

            registerHunt(form);
        } catch (error) {
            console.log(error);
        }
    })

    async function registerHunt(form) {
        const newHunt = {
            title: form.title.value,
            createdBy: sessionStorage.getItem('name'),
            editedBy: '',
            status: form.status.value,
            difficulty: form.difficulty.value,
            city: form.city.value,
            state: form.uf.value,
            entityId: form.entity.value,
            latitude: form.latitude.value,
            longitude: form.longitude.value,
            date: form.date.value,
            summary: form.summary.value
        }

        try {
            const response = await fetch('http://localhost:3000/hunts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newHunt)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            alert('Cadastro realizado')
        } catch (error) {
            console.log(error);
        }
    }

    async function getEntities() {
        try {
            const entitySelect = document.querySelector('#entity');

            const response = await fetch('http://localhost:3000/entities');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const entities = await response.json();
            
            entities.forEach((entity) => {
                const element = document.createElement('option');
                
                element.value = entity.id;
                element.textContent = entity.name;
                entitySelect.appendChild(element);
            })

        } catch (error) {
            console.log(error)
        }
    }
    getEntities()
})