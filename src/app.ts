import {ThemeSwitcher }  from "./theme";
import {SaveFileRepair}  from "./file_upload";

class App {
    constructor() {
        this.init();
    }

    private init(): void {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        // TODO: MAKE SAVE EDITOR HERE :3
        // appContainer.innerHTML = `
        //     <div class="row">
        //         <div class="col-md-8">
        //             <div id="card-container"></div>
        //         </div>
        //         <div class="col-md-4">
        //             <div id="button-container" class="d-grid gap-2"></div>
        //         </div>
        //     </div>
        // `;

        new ThemeSwitcher();
        new SaveFileRepair();
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});