document.addEventListener('DOMContentLoaded', async () => {
    const containerFilters = document.querySelector('.container-filters');
    const btnFilter = document.querySelector('.button-filter');
    const formFilter = document.querySelector('.form-filters');
    const btnSubmitFilter = document.querySelector('.form-filters__button-submit');
    const btnClearFilters = document.querySelector('.form-filters__button-clear');
    let allHunts = [];

    const map = L.map('map-hunts').setView([-15.7801, -47.9292], 1);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    async function getLabelFilters() {
        const selectEntity = document.querySelector('#entity');
        const selectCity = document.querySelector('#city');

        try {
            const responseEntities = await fetch('http://localhost:3000/entities');

            if (!responseEntities.ok) {
                throw new Error(`Erro HTTP: ${responseEntities.status}`);
            }

            const entities = await responseEntities.json();
            selectEntity.innerHTML = '<option value="" selected>Selecione...</option>';

            entities.forEach((entity) => {
                const optionEntity = document.createElement('option');
                optionEntity.value = entity.id;
                optionEntity.textContent = entity.name
                selectEntity.appendChild(optionEntity);
            })

            selectCity.innerHTML = '<option value="" selected>Selecione...</option>';

            allHunts.forEach((hunt) => {
                const optionCity = document.createElement('option');
                optionCity.value = hunt.city;
                optionCity.textContent = hunt.city
                selectCity.appendChild(optionCity);
            })

        } catch (error) {
            console.log(error);
        }

    }

    async function getHunts() {
        const response = await fetch('http://localhost:3000/hunts');

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        allHunts = await response.json();
    }

    function addMarkerMap(hunts) {
        markersLayer.clearLayers();
        
        const imgsPins = {
            'facil': L.icon({
                iconUrl: "/assets/img/img-map/img_pin_green.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }),
            'medio': L.icon({
                iconUrl: "/assets/img/img-map/img_pin_yellow.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }),
            'dificil': L.icon({
                iconUrl: "/assets/img/img-map/img_pin_red.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }

        try {
            hunts.forEach((hunt) => {
                const lat = hunt.latitude;
                const long = hunt.longitude;

                L.marker([lat, long], { icon: imgsPins[hunt.difficulty] })
                .addTo(markersLayer)
                .bindPopup(`
                    <div class="pop-up">
                        <strong>${hunt.title}</strong><br>${hunt.city}-${hunt.state}
                    </div>`);
            });

        } catch (error) {
            console.log(error);
        }
    }

    async function makesFilter(form) {
        try {
            const filtered = allHunts.filter((hunt) => {
                return (
                    (!form.entity.value || hunt.entityId === form.entity.value) &&
                    (!form.difficulty.value || hunt.difficulty === form.difficulty.value) &&
                    (!form.status.value || hunt.status === form.status.value) &&
                    (!form.city.value || hunt.city === form.city.value)
                )
            });

            addMarkerMap(filtered)

        } catch (error) {
            console.log(error);
        }
    }

    btnFilter.addEventListener('click', () => {
        containerFilters.classList.toggle('container-filters--open');
        btnFilter.classList.toggle('button-filter--open');
    })

    btnSubmitFilter.addEventListener('click', (event) => {
        event.preventDefault();
        makesFilter(formFilter);
    })

    btnClearFilters.addEventListener('click', async () => {
        await getHunts();
        addMarkerMap(allHunts);
    })


    await getHunts();
    addMarkerMap(allHunts);
    await getLabelFilters();
})