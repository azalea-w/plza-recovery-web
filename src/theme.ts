export class ThemeSwitcher {
    private themeSwitcher: HTMLElement;
    private themeIcon: Element;
    private body: HTMLBodyElement;
    private currentTheme: string;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.themeSwitcher = document.getElementById('theme-switcher')!;
        this.themeIcon = this.themeSwitcher.querySelector('.theme-icon')!;
        this.body = document.body as HTMLBodyElement;

        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(this.currentTheme);

        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.themeSwitcher.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    private toggleTheme(): void {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    private applyTheme(theme: string): void {
        this.body.setAttribute('data-bs-theme', theme);

        this.body.className = theme === 'dark' ? 'bg-dark' : 'bg-light';
        this.body.classList.add("vh-100");


        this.updateButtonAppearance(theme);

        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    private updateButtonAppearance(theme: string): void {
        const icon = this.themeIcon;
        const button = this.themeSwitcher;

        if (theme === 'dark') {
            icon.className = 'theme-icon bi bi-sun-fill';
            button.innerHTML = '<i class="theme-icon bi bi-sun-fill"></i> Light Mode';
        } else {
            icon.className = 'theme-icon bi bi-moon-fill';
            button.innerHTML = '<i class="theme-icon bi bi-moon-fill"></i> Dark Mode';
        }
    }

    public getCurrentTheme(): string {
        return this.currentTheme;
    }
}
