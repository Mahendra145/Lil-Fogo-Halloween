document.addEventListener('DOMContentLoaded', () => {

    // --- Get Main HTML Elements ---
    const introScreen = document.getElementById('intro-screen');
    const appContainer = document.getElementById('app-container');

    // --- Logic for Intro Screen Transition ---
    setTimeout(() => {
        introScreen.classList.remove('active');
        appContainer.classList.add('active');
        document.body.classList.add('editor-active'); 
    }, 5000);

   // Check if we are on a mobile-sized screen (matches your CSS breakpoint)
    const isMobile = window.innerWidth <= 900;

    const canvas = new fabric.Canvas('editorCanvas', {
        width: 500,
        height: 500,
        // --- THIS IS THE FIX ---
        // This allows the page to scroll when you drag your finger
        // vertically over the canvas on a mobile device.
        allowTouchScrolling: isMobile
    });

    // --- Get Editor Elements ---
    const pfpUpload = document.getElementById('pfpUpload');
    const uploadBtn = document.getElementById('uploadBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const traitCards = document.querySelectorAll('.trait-card');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const deleteBtn = document.getElementById('deleteBtn');

    // --- Event Listeners ---
    uploadBtn.addEventListener('click', () => pfpUpload.click());
    pfpUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                fabric.Image.fromURL(event.target.result, (img) => {
                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                        scaleX: canvas.width / img.width,
                        scaleY: canvas.height / img.height,
                    });
                    uploadPlaceholder.style.display = 'none';
                });
            };
            reader.readAsDataURL(file);
        }
    });

    traitCards.forEach(card => {
        card.addEventListener('click', () => {
            const traitSrc = card.dataset.trait;
            const traitType = card.dataset.type;

            if (traitType === 'background') {
                addLockedOverlay(traitSrc);
            } else {
                addEditableTrait(traitSrc);
            }
        });
    });

    downloadBtn.addEventListener('click', () => {
        canvas.discardActiveObject();
        canvas.renderAll(); 
        const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'pfp-creation.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // --- THIS IS THE FIX ---
    // This function now clears EVERYTHING (costumes and the background effect).
    clearBtn.addEventListener('click', () => {
        canvas.getObjects().forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
    });

    deleteBtn.addEventListener('click', () => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && !activeObject.isBackgroundEffect) {
            canvas.remove(activeObject);
            canvas.renderAll();
        }
    });

    // --- Core Functions ---
    function addLockedOverlay(imgURL) {
        const oldBackgroundEffect = canvas.getObjects().find(obj => obj.isBackgroundEffect);
        if (oldBackgroundEffect) canvas.remove(oldBackgroundEffect);

        fabric.Image.fromURL(imgURL, (img) => {
            img.set({
                scaleX: canvas.width / img.width,
                scaleY: canvas.height / img.height,
                selectable: false,
                evented: false,
                isBackgroundEffect: true
            });
            canvas.add(img);
            canvas.sendToBack();
            canvas.renderAll();
        });
    }

    function addEditableTrait(imgURL) {
        fabric.Image.fromURL(imgURL, (img) => {
            img.scaleToWidth(150);
            img.set({
                left: (canvas.width - img.getScaledWidth()) / 2,
                top: (canvas.height - img.getScaledHeight()) / 2,
                cornerColor: '#ff6600',
                cornerSize: 10,
                transparentCorners: false,
                borderColor: '#ff6600',
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.bringToFront();
        });
    }
    
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObject()) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && !activeObject.isBackgroundEffect) {
                canvas.remove(activeObject);
                canvas.renderAll();
            }
        }
    });

});
