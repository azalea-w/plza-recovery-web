export class SaveFileRepair {
    private dropZone: HTMLElement;
    private fileInput: HTMLInputElement;
    private resultDiv: HTMLElement;


    constructor() {
        this.dropZone = document.getElementById('drop-zone')!;
        this.fileInput = document.getElementById('file-input')! as HTMLInputElement;
        this.resultDiv = document.getElementById('result')!;

        this.initEventListeners();
    }

    initEventListeners() {
        this.fileInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files.length > 0) {
                this.handleFile(target.files?.item(0)).catch();
            }
        });


        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');

            if (e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0]).catch();
            }
        });
    }

    async handleFile(file) {
        this.showLoading('Repairing save file...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/repair', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showResult('success',
                    `Successfully repaired save file! Modified ${result.edited_count} entries.`,
                    result.download_url,
                    result.filename
                );
            } else {
                this.showResult('error', result["log"] || 'Repair failed');
            }
        } catch (error) {
            this.showResult('error', 'Network error: ' + error.message);
        }
    }

    showLoading(message) {
        this.resultDiv.innerHTML = `
            <div id="loading">
                <div class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
                ${message}
            </div>
        `;
    }

    showResult(type, message, downloadUrl = null, filename = null) {
        let html = message;
        document.getElementById("loading").style.display = "hidden";

        if (downloadUrl) {
            html += `<br><a href="${downloadUrl}" class="download-btn" download="${filename}">Download Repaired File</a>`;
        }

        this.resultDiv.innerHTML = html;
    }
}

