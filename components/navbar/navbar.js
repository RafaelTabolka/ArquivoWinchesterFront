class AppNavbar extends HTMLElement {
    async connectedCallback() {
        // Cria o componente AppNavbar
        const response = await fetch('/components/navbar/navbar.html');
        const html = await response.text();
        this.innerHTML = html;

        // Todas as variáveis utilizadas
        const buttonHamburguer = this.querySelector('.button-hamburguer');
        const headerContainer = this.querySelector('.header-container');
        const hasLogin = sessionStorage.getItem('name');
        const hideWithLogin = this.querySelectorAll('.header-container__hide-with-login');
        const hideWithoutLogin = this.querySelectorAll('.header-container__hide-without-login');
        const logout = this.querySelector('.header-container__logout');
        const currentPath = new URL(window.location.href).pathname;
        const ariaCurrent = this.querySelectorAll('.header-container__aria-current');

        // Eventos do navbar
        buttonHamburguer.addEventListener('click', () => {
            headerContainer.classList.toggle('header-container--open');
            buttonHamburguer.classList.toggle('button-hamburguer--open');
        })

        logout.addEventListener('click', () => {
            sessionStorage.removeItem('name');
            window.location.href = '/pages/login/login.html'
        })

        // Links dinâmicos do navbar
        if (hasLogin !== null) {
            hideWithLogin.forEach((element) => element.remove());
        } else {
            hideWithoutLogin.forEach((element) => element.remove());
        }

        // Marca a página atual estilizando o link do navbar
        ariaCurrent.forEach((a) => {
            const linkPath = new URL(a.href).pathname;

            const prefix = a.dataset.activePrefix;

            const isActive = prefix
            ? currentPath.startsWith(prefix)
            : linkPath === currentPath;

            if (isActive) {
                a.setAttribute('aria-current', 'page');
            } else {
                a.removeAttribute('aria-current');
            }
        })
    }
}

customElements.define('app-navbar', AppNavbar);