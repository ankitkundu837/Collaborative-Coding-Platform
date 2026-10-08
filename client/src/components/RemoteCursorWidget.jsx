class RemoteCursorWidget {
    constructor(monaco, editor, id, name, color = "#DEDBC8", lineNumber = 1, column = 1) {
        this.id = id;
        this.editor = editor;
        this.monaco = monaco;
        this.color = color;
        this.name = name;

        this.position = {
            lineNumber,
            column
        };

        const lineHeight = (this.editor?.getOption && this.monaco?.editor?.EditorOption?.lineHeight)
            ? this.editor.getOption(this.monaco.editor.EditorOption.lineHeight)
            : 20;

        this.domNode = document.createElement("div");
        this.domNode.className = "remote-cursor-widget" + (lineNumber === 1 ? " cursor-top-line" : "");

        this.domNode.innerHTML = `
            <div class="remote-cursor-hitbox" style="height: ${lineHeight}px;">
                <div class="remote-line remote-cursor-blinking" style="background: ${color}; height: ${lineHeight}px;"></div>
                <div class="remote-name" style="background: ${color};">${name}</div>
            </div>
        `;

        this.hitboxEl = this.domNode.querySelector(".remote-cursor-hitbox");
        this.lineEl = this.domNode.querySelector(".remote-line");
        this.nameEl = this.domNode.querySelector(".remote-name");
    }

    getId() {
        return "remote-cursor-" + this.id;
    }

    getDomNode() {
        return this.domNode;
    }

    getPosition() {
        return {
            position: this.position,
            preference: [
                this.monaco.editor.ContentWidgetPositionPreference.EXACT
            ]
        };
    }

    update(lineNumber, column, color, name) {
        this.position = {
            lineNumber,
            column
        };

        if (lineNumber === 1) {
            this.domNode.classList.add("cursor-top-line");
        } else {
            this.domNode.classList.remove("cursor-top-line");
        }

        const lineHeight = (this.editor?.getOption && this.monaco?.editor?.EditorOption?.lineHeight)
            ? this.editor.getOption(this.monaco.editor.EditorOption.lineHeight)
            : 20;

        if (this.hitboxEl) {
            this.hitboxEl.style.height = `${lineHeight}px`;
        }
        if (this.lineEl) {
            this.lineEl.style.height = `${lineHeight}px`;
        }

        if (color && color !== this.color) {
            this.color = color;
            if (this.nameEl) this.nameEl.style.background = color;
            if (this.lineEl) this.lineEl.style.background = color;
        }

        if (name && name !== this.name) {
            this.name = name;
            if (this.nameEl) this.nameEl.textContent = name;
        }

        // Restart blink animation cycle so cursor is instantly solid on movement
        if (this.lineEl) {
            this.lineEl.classList.remove("remote-cursor-blinking");
            void this.lineEl.offsetWidth;
            this.lineEl.classList.add("remote-cursor-blinking");
        }

        this.editor.layoutContentWidget(this);
    }
}

export default RemoteCursorWidget;