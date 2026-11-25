document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('.section-table__tbody');
    const dialogEdit = document.querySelector('.dialog-edit');
    const btnCloseModal = document.querySelector('.form-edit__close-modal');
    const btnConfirmEdit = document.querySelector('.form-edit__button-submit');
    const spanQtyEntities = document.querySelector('.section-table__span-qty');
    const formEdit = document.querySelector('.form-edit');
    const spanFields = document.querySelectorAll('.form-edit__span-field');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const inputImage = formEdit.querySelector('input[name="entityImage"]');
    let currentEntity = null;
    // let entityId = null;
    const limitPerPage = 4;
    let page = 1;

    async function getEntities(currentPage) {
        let qtyEntities = await getQtyEntities();
        const start = (currentPage - 1) * limitPerPage;


        const riskLevelsStyle = {
            1: 'section-table__level-risk--1',
            2: 'section-table__level-risk--2',
            3: 'section-table__level-risk--3',
            4: 'section-table__level-risk--4',
            5: 'section-table__level-risk--5'
        }

        try {
            const response = await fetch(`http://localhost:3000/entities?_start=${start}&_limit=${limitPerPage}`);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const entities = await response.json();
            tbody.innerHTML = '';

            entities.forEach((entity) => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${entity.name}</td>
                    <td class="section-table__hide-in-mobile">${entity.counterMeasure}</td>
                    <td><span class="${riskLevelsStyle[entity.riskLevel]}">${entity.riskLevel}</span></td>
                    <td class="section-table__hide-in-mobile">${entity.commonSigns}</td>
                    
                    <td class="section-table__hide-in-mobile">
                        <button class="section-table__button-edit">                                
                            <img src="/assets/img/img-list-entities/img_edit.png" alt="Ícone de diário de caçador (anotações do Arquivo Winchester)">
                        </button>
                    </td>
                    
                    <td class="section-table__hide-in-mobile">
                        <button class="section-table__image-delete">                                
                            <img src="/assets/img/img-list-entities/img_crash.png" alt="Ícone de lixeira para excluir/remover o registro">
                        </button>
                    </td>
                    <td class="section-table__hide-in-desktop">
                        <img class="section-table__arrow-down" src="/assets/img/img-home/img_arrow_down.png" alt="">
                    </td>
                `
                tbody.appendChild(tr);
                tr.dataset.id = entity.id;

                const trDetails = document.createElement('tr');
                trDetails.classList.add('section-table__details');
                trDetails.classList.add('section-table__hide-in-desktop');

                trDetails.innerHTML = `
                    <td colspan="7">
                        <p>Sinais Comuns: <span>${entity.commonSigns}</span></p>
                        <p>Contramedida: <span>${entity.counterMeasure}</span></p>
                        
                        <div class="section-table__images-details">
                            <button class="section-table__button-edit">                                    
                                <img src="/assets/img/img-list-entities/img_edit.png" alt="Ícone de diário de caçador (anotações do Arquivo Winchester)">
                            </button>

                            <button class="section-table__image-delete">
                                <img src="/assets/img/img-list-entities/img_crash.png" alt="Ícone de lixeira para excluir/remover o registro">
                            </button>
                        </div>
                    </td>
                `

                tbody.appendChild(trDetails);
                trDetails.dataset.id = entity.id;
            })

            spanQtyEntities.textContent = `Entidades cadastradas: ${qtyEntities}`

            prevBtn.disabled = currentPage === 1;

            nextBtn.disabled = (currentPage * limitPerPage) >= qtyEntities;

        } catch (error) {
            console.log(error);
        }
    }

    async function getQtyEntities() {
        try {
            const response = await fetch('http://localhost:3000/entities');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const entities = await response.json();

            let qtyEntities = entities.length;

            return qtyEntities;

        } catch (error) {
            console.log(error);
        }
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        })
    }

    prevBtn.addEventListener('click', () => {
        page--;
        getEntities(page);
    })

    nextBtn.addEventListener('click', () => {
        page++;
        getEntities(page);
    })

    tbody.addEventListener('click', async (event) => {
        const arrowDownClicked = event.target.closest('.section-table__arrow-down')
        const btnOpenModal = event.target.closest('.section-table__button-edit');
        const btnDeleteEntity = event.target.closest('.section-table__image-delete');
        const spanFile = formEdit.querySelector('.form-edit__file-name');

        if (arrowDownClicked !== null) {
            const tr = arrowDownClicked.closest('tr');
            const trDetails = tr.nextElementSibling;
            trDetails.classList.toggle('section-table__details--open')
        }

        try {
            if (btnOpenModal !== null) {
                const tr = btnOpenModal.closest('tr');
                const entityId = tr.dataset.id;

                const response = await fetch(`http://localhost:3000/entities/${entityId}`);

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const entity = await response.json();
                currentEntity = entity;
                inputImage.value = '';

                formEdit.entityName.value = entity.name;
                formEdit.counterMeasure.value = entity.counterMeasure
                formEdit.riskLevel.value = entity.riskLevel
                formEdit.commonSigns.value = entity.commonSigns

                const fileName = entity.image.split('/').pop();
                spanFile.textContent = fileName;

                dialogEdit.showModal();

            }

            if (btnDeleteEntity !== null) {
                const tr = btnDeleteEntity.closest('tr');
                const entityId = tr.dataset.id;

                const wantDelete = confirm('Certeza que deseja excluir? Não terá volta!');

                if (wantDelete) {
                    const responseHunts = await fetch('http://localhost:3000/hunts');

                    if (!responseHunts.ok) {
                        throw new Error(`Erro HTTP: ${responseHunts.status}`);
                    }

                    const hunts = await responseHunts.json();

                    for (const hunt of hunts) {
                        if (hunt.entityId === entityId) {
                            const responseHuntDelete = await fetch(`http://localhost:3000/hunts/${hunt.id}`, {
                                method: 'DELETE'
                            });

                            if (!responseHuntDelete.ok) {
                                throw new Error(`Erro HTTP: ${responseHuntDelete.status}`);
                            }
                        }
                    }

                    const responseEntities = await fetch(`http://localhost:3000/entities/${entityId}`, {
                        method: 'DELETE'
                    })

                    if (!responseEntities.ok) {
                        throw new Error();
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    })

    btnCloseModal.addEventListener('click', () => {
        dialogEdit.close();
    })

    btnConfirmEdit.addEventListener('click', async (event) => {
        event.preventDefault();

        const formFields = [
            { name: 'entityName' },
            { name: 'counterMeasure' },
            { name: 'riskLevel' },
            // { name: 'entityImage' }, não colocar este campo, pois no formulário de edição quando este campo fica vazio significa que não vai ser alterado
            { name: 'commonSigns' }
        ]

        let hasError = false;
        spanFields.forEach((span) => {
            span.classList.remove('form-edit__span-field--open');
        })

        formFields.forEach((field) => {
            const value = formEdit[field.name].value.trim();

            if (value === '') {
                const input = formEdit[field.name];
                const element = input.closest('.form-edit__closest');
                const spanField = element.querySelector('.form-edit__span-field');
                spanField.classList.add('form-edit__span-field--open');
                hasError = true;
            }
        })

        const file = inputImage.files[0];
        let isValid = true;

        if (file !== undefined) {
            let fileName;
            fileName = file.name.toLowerCase();
            const extention = fileName.split('.').pop();
            const extensions = ['png', 'jpg', 'jpeg'];
            isValid = extensions.includes(extention);
        }

        if (!isValid) {
            const spanFile = formEdit.querySelector('.form-edit__span-file');
            spanFile.classList.add('form-edit__span-field--open');
            hasError = true;
        }

        if (hasError) {
            return
        }

        const newEntity = {
            name: formEdit.entityName.value,
            updatedBy: sessionStorage.getItem('name'),
            counterMeasure: formEdit.counterMeasure.value,
            riskLevel: Number(formEdit.riskLevel.value),
            image: file !== undefined ? await fileToBase64(file) : currentEntity.image,
            commonSigns: formEdit.commonSigns.value
        }

        try {
            const response = await fetch(`http://localhost:3000/entities/${entityId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEntity)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            alert('Entidade atualizada');
        } catch (error) {
            console.log(error);
        }
    })

    inputImage.addEventListener('change', () => {
        const span = formEdit.querySelector('.form-edit__file-name');
        const file = inputImage.files[0];

        if (file === undefined) {
            return
        }

        span.textContent = `Arquivo: ${file.name}`;
    })

    getEntities(page);
})