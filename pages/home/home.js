import { DIFFICULTY } from "../../assets/js/constants/difficulty.js";

document.addEventListener('DOMContentLoaded', () => {
    const openCases = document.querySelector('.section-cards__open-cases');
    const casesUnderInvestigation = document.querySelector('.section-cards__cases-under-investigation');
    const solvedCases = document.querySelector('.section-cards__solved-cases');
    const archivedCases = document.querySelector('.section-cards__archived-cases');
    const tBody = document.querySelector('.section-table__tbody');
    
    
    tBody.addEventListener('click', (event) => {
        const arrowDown = event.target.closest('.section-table__arrow-down');
        
        if (arrowDown !== null) {
            const trClick = arrowDown.closest('tr');
            const trDetails = trClick.nextElementSibling;
            trDetails.classList.toggle('section-table__details--open');
        }
        
    })

    async function cardValues() {
        try {
            const response = await fetch('http://localhost:3000/hunts');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const hunts = await response.json();

            const qtyOpen = hunts.filter((hunt) => hunt.status === 'aberto');
            const qtyUnderInvestigation = hunts.filter((hunt) => hunt.status === 'investigando');
            const qtySolved = hunts.filter((hunt) => hunt.status === 'resolvido');
            const qtyArchived = hunts.filter((hunt) => hunt.status === 'arquivado');

            openCases.innerHTML = qtyOpen.length;
            casesUnderInvestigation.innerHTML = qtyUnderInvestigation.length;
            solvedCases.innerHTML = qtySolved.length;
            archivedCases.innerHTML = qtyArchived.length;


        } catch (error) {
            console.log(error);
        }
    }

    async function tableValues() {
        const stylesDifficulty = {
            'facil' : 'section-table__easy-difficulty',
            'medio' : 'section-table__medium-difficulty',
            'dificil' : 'section-table__hard-difficulty'
        };
        
        try {

            const response = await fetch('http://localhost:3000/hunts');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const hunts = await response.json();

            // Esta linha pega somente as cinco últimas caçadas cadastradas e como só o slice faz elas virem na mesma sequência, precisa do reverse para inverter
            const maxFiveHunts = hunts.slice(-5).reverse(); 
            
            const responseEntities = await fetch('http://localhost:3000/entities');

            if (!responseEntities.ok) {
                throw new Error(`Erro HTTP: ${responseEntities.status}`);
            }

            const entities = await responseEntities.json();

            maxFiveHunts.forEach((hunt) => {
                const tr = document.createElement('tr');
                const date = new Date(hunt.date).toLocaleDateString('pt-BR');
                const matchEntity = entities.find((entity) => entity.id === hunt.entityId);
                const difficulty = DIFFICULTY[hunt.difficulty];

                tr.innerHTML = `
                    <td>${hunt.title}</td>
                    <td class="section-table__hide-in-mobile">${matchEntity.name}</td>
                    <td><span class="${stylesDifficulty[hunt.difficulty]}">${difficulty}</span></td>
                    <td class="section-table__hide-in-mobile">${hunt.city}</td>
                    <td class="section-table__hide-in-mobile">${date}</td>
                    <td class="section-table__hide-in-mobile">${hunt.summary}</td>
                    <td class="section-table__hide-in-desktop">
                        <img class="section-table__arrow-down" src="/assets/img/img-home/img_arrow_down.png" alt="seta apontando para baixo">
                    </td>
                `

                tBody.appendChild(tr);

                const trDetailsData = document.createElement('tr');
                trDetailsData.classList.add('section-table__details');
                trDetailsData.classList.add('section-table__hide-in-desktop');

                trDetailsData.innerHTML = `
                <td colspan="7">
                    <p>Tipo: <span>${matchEntity.name}</span></p>
                    <p>Cidade: <span>${hunt.city}</span></p>
                    <p>Data: <span>${date}</span></p>
                    
                    <p>
                        Descrição:
                        <span>${hunt.summary}</span>
                    </p>
                </td>
                `

                tBody.appendChild(trDetailsData);
            })
        } catch (error) {
            console.log(error);
        }
    }

    cardValues();
    tableValues();

})