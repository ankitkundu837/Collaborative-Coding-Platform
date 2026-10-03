class RemoteCursorWidget {
    constructor(monaco, editor, id, name, color = "#6366f1", lineNumber = 1, column = 1) {
        this.id = id;
        this.editor = editor;
        this.monaco = monaco;
        this.color = color;

        this.position = {
            lineNumber,
            column
        };

        this.domNode = document.createElement("div");
        this.domNode.className = "remote-cursor-widget";

        this.domNode.innerHTML = `
            <div class="remote-name" style="background: ${color};">${name}</div>
            <div class="remote-line" style="background: ${color};"></div>
        `;
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

    update(lineNumber, column, color) {
        this.position = {
            lineNumber,
            column
        };

        if (color && color !== this.color) {
            this.color = color;
            const nameEl = this.domNode.querySelector(".remote-name");
            const lineEl = this.domNode.querySelector(".remote-line");
            if (nameEl) nameEl.style.background = color;
            if (lineEl) lineEl.style.background = color;
        }

        this.editor.layoutContentWidget(this);
    }
}

export default RemoteCursorWidget;