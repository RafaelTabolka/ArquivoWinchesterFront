document.addEventListener('DOMContentLoaded', () => {
    const spanFields = document.querySelectorAll('.form__span-field');
    const form = document.querySelector('.form');
    const containerFile = document.querySelector('.form__container-file');

    function fileToBase64(file) {
        // FileReader é uma função assíncrona que não retorna uma promise para usarmos await, então o colocamos dentro de uma Promise
        // resolve(valor): marca a Promise como sucesso e entrega valor.
        // reject(erro): marca a Promise como falha e entrega erro.
        return new Promise((resolve, reject) => {
            const reader = new FileReader(); // Cria um leitor de arquivos
            reader.onload = () => resolve(reader.result); // Quando terminar de ler, devolve a string base64
            reader.onerror = reject; // Se der ruim, vai ser rejeitado
            reader.readAsDataURL(file); // Começa a ler o arquivo para ser transformado

            // Primeiro os eventos precisam ser carregados e depois o arquivo é iniciado a leitura
        })
    }
    
    document.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const formFields = [
                { name: 'entityName' },
                { name: 'counterMeasure' },
                { name: 'riskLevel' },
                { name: 'entityImage' },
                { name: 'commonSigns' }
            ]

            let hasError = false;
            spanFields.forEach((span) => {
                span.classList.remove('form__span-field--open');
            })

            formFields.forEach((field) => {
                const value = form[field.name].value.trim();

                if (value === '') {
                    const input = form[field.name];
                    const element = input.closest('.form__closest');
                    const spanField = element.querySelector('.form__span-field');
                    spanField.classList.add('form__span-field--open');
                    hasError = true;
                }
            })

            const file = form.entityImage.files[0];
            let isValid;
            let name;

            if (file === undefined) {
                isValid = false;
            } else {
                name = file.name.toLowerCase();
                const extention = name.split('.').pop();
                const extensions = ['png', 'jpg', 'jpeg'];
                isValid = extensions.includes(extention);
            }

            if (!isValid) {
                const spanFile = form.querySelector('.form__span-file');
                spanFile.classList.add('form__span-field--open');
                hasError = true;
            }

            if (hasError) {
                return
            }

            const imgBase64 = await fileToBase64(file);

            const newEntity = {
                name: form.entityName.value,
                createdBy: sessionStorage.getItem('name'),
                updatedBy: "",
                counterMeasure: form.counterMeasure.value,
                riskLevel: form.riskLevel.value,
                image: imgBase64,
                commonSigns: form.commonSigns.value
            }

            const response = await fetch('http://localhost:3000/entities', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(newEntity)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            alert('Entidade cadastrada');


        } catch (error) {
            console.log(error);
        }
    })

    containerFile.addEventListener('change', () => {
        const span = form.querySelector('.form__file-name');
        const name = form.entityImage.files[0].name;

        span.innerHTML = `Arquivo: ${name}`;
        containerFile.appendChild(span);
    })

})