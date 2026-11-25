document.addEventListener('DOMContentLoaded', () => {
    const containerCards = document.querySelector('.container-cards');
    const limit = 4;
    let page = 1;
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dialogEdit = document.querySelector('.dialog-edit');
    const closeDialog = document.querySelector('.form__close-modal');
    const btnUpdateDialog = document.querySelector('.buttons__button-update');
    const btnDeleteDialog = document.querySelector('.buttons__button-delete');
    let idCardOpen;
    const form = document.querySelector('.form');

    containerCards.addEventListener('click', (event) => {
        const card = event.target.closest('.container-cards__card');

        openCardClicked(card);
    });

    async function getCards(currentPage) {
        const statusHunts = {
            'aberto': 'container-cards__status-open',
            'investigando': 'container-cards__status-investigation',
            'resolvido': 'container-cards__status-solved',
            'arquivado': 'container-cards__status-archived'
        };

        try {
            const start = (currentPage - 1) * limit;
            const responseHunts = await fetch(`http://localhost:3000/hunts?_start=${start}&_limit=${limit}`);
            const responseEntities = await fetch('http://localhost:3000/entities');

            if (!responseHunts.ok || !responseEntities.ok) {
                throw new Error(`Erro HTTP: ${!responseHunts.ok ? responseHunts.status : responseEntities.status}`)
            }

            const hunts = await responseHunts.json();
            const entities = await responseEntities.json();

            containerCards.innerHTML = '';
            hunts.forEach((hunt) => {
                const article = document.createElement('article');
                article.classList.add('container-cards__card');

                const entity = entities.find((entity) => String(entity.id) === String(hunt.entityId));
                // console.log(entity)
                // console.log(hunt)
                article.innerHTML = `
                <figure>
                    <img src="${entity.image}" alt="Foto da caçada capturada pela câmera" />
                </figure>
    
                <div class="container-cards__content">
                    <h3>${hunt.title}</h3>
    
                    <p class="container-cards__status-hunt">
                        <span class="${statusHunts[hunt.status]}">${hunt.status}</span>
                    </p>
    
                    <ul>
                        <li>
                            <strong>Cidade:</strong> ${hunt.city} - ${hunt.state}
                        </li>
    
                        <li>
                            <strong>Entidade:</strong> ${entity.name}
                        </li>
                    </ul>
    
                    <h4>Resumo</h4>
    
                    <div class="container-cards__summary" data-area="resumo">
                        <p>${hunt.summary}</p>
                    </div>
                </div>
            `
                article.dataset.id = hunt.id
                containerCards.append(article);

            });

            prevBtn.disabled = currentPage === 1;

            getQtyHunts()
                .then((totalHunts) => {
                    nextBtn.disabled = (start + limit) >= totalHunts;
                })
        } catch (error) {
            console.log(error);
        }
    }

    async function getQtyHunts() {
        try {
            const response = await fetch('http://localhost:3000/hunts');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const hunts = await response.json();
            let qtyHunts = 0;

            hunts.map(() => qtyHunts++);

            return qtyHunts;
        } catch (error) {
            console.log(error);
        }
    }

    async function openCardClicked(card) {
        if (card !== null) {
            const clearSpan = form.querySelectorAll('.fieldset__span');

            clearSpan.forEach((e) => {
                e.classList.remove('fieldset__span--open');
            })

            dialogEdit.showModal();

            fetch('http://localhost:3000/entities')
                .then((responseEntities) => responseEntities.json())
                .then((entities) => {
                    const selectEntity = document.querySelector('#entity');
                    selectEntity.innerHTML = '<option value="" selected disabled>Selecione...</option>'
                    entities.forEach((entity) => {
                        const option = document.createElement('option');
                        option.value = entity.id;
                        option.textContent = entity.name;
                        selectEntity.appendChild(option);
                    })

                    fetch(`http://localhost:3000/hunts/${card.dataset.id}`)
                        .then((response) => response.json())
                        .then((hunt) => {
                            form.title.value = hunt.title,
                                form.status.value = hunt.status,
                                form.difficulty.value = hunt.difficulty,
                                form.city.value = hunt.city,
                                form.uf.value = hunt.state.toUpperCase(),
                                form.entity.value = hunt.entityId,
                                form.latitude.value = hunt.latitude,
                                form.longitude.value = hunt.longitude,
                                form.date.value = hunt.date,
                                form.summary.value = hunt.summary
                        });
                });

            idCardOpen = card.dataset.id;
        };
    }

    async function updateCard() {
        try {
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
                throw new Error();
            }

            const responseEntities = await fetch('http://localhost:3000/entities');

            if (!responseEntities.ok) {
                throw new Error(`Erro HTTP: ${responseEntities.status}`);
            }

            const entities = await responseEntities.json();

            const entityChoosed = entities.find((entity) => entity.id === form.entity.value);

            const newInformations = {
                title: form.title.value,
                editedBy: sessionStorage.getItem('name'),
                status: form.status.value,
                difficulty: form.difficulty.value,
                city: form.city.value,
                state: form.uf.value.toUpperCase(),
                entityId: entityChoosed.id,
                latitude: latitude,
                longitude: longitude,
                date: form.date.value,
                summary: form.summary.value
            }

            const response = await fetch(`http://localhost:3000/hunts/${idCardOpen}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newInformations)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            alert('Caçada atualizada');

        } catch (error) {
            console.log(error);
        }
    }

    async function deleteCard() {
        const wantDelete = confirm('Tem certeza que deseja excluir? Essa ação não terá retorno!')

        if (wantDelete) {
            try {
                const response = await fetch(`http://localhost:3000/hunts/${idCardOpen}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                alert('Caçada excluída');
            } catch (error) {
                console.log(error);
            }
        }
    }


    prevBtn.addEventListener('click', () => {
        page--;
        getCards(page);
    });

    nextBtn.addEventListener('click', () => {
        page++;
        getCards(page)
    })

    closeDialog.addEventListener('click', () => {
        dialogEdit.close();
    })

    btnUpdateDialog.addEventListener('click', () => {
        updateCard();
    })

    btnDeleteDialog.addEventListener('click', () => {
        deleteCard();
        getCards(page);
    })

    getCards(page)
})