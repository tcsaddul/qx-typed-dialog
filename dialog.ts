module dialog {
    export class EntryBase<T> extends qx.ui.container.Composite {
        caption: string;

        firstFocusable: qx.ui.core.Widget = null;

        constructor() {
            super(null);
        }

        getData(): T {
            return null;
        }

        setData() {
        }

        handler(caption: string) {
        }
    }

    export class DialogWindow<T> extends qx.ui.window.Window {
        callback: (name: string, data: T) => void;
        entry: EntryBase<T>;
        buttons: Array<ButtonData>;
        firstFocusable: qx.ui.core.Widget = null;

        constructor() {
            super("");

            this.setLayout(new qx.ui.layout.VBox(10));

            var root = this.getApplicationRoot();
            root.setBlockerColor("black");
            root.setBlockerOpacity(0.4);

            this.addListener("appear", () => {
                this.center();
                if (this.firstFocusable)
                    this.firstFocusable.focus();                
            }, this);

            this.setModal(true);
        }

        createForm = () => {
            this.add(this.entry, { flex: 1 });

            var bpLayout = new qx.ui.layout.HBox(10);
            bpLayout.setAlignX("center");

            var buttonPane = new qx.ui.container.Composite(bpLayout);
            this.add(buttonPane);

            this.firstFocusable = this.entry.firstFocusable;
            var noFocus = (this.firstFocusable === null);

            this.buttons.forEach(e => {
                var button = newButton(this, e.caption, e.color, 70, (c) => this.handler(c));
                buttonPane.add(button);

                if (noFocus)
                    this.firstFocusable == button;
            });
        }

        handler(caption: string) {
            this.hide();

            if (this.callback) {
                this.callback(caption, this.entry.getData());
            }
        }
    }

    export function showDialog<T>(entry: () => EntryBase<T>, buttons: () => Array<ButtonData>, focus: number,
        callback?: (name: string, data: T) => void) {

        var dialog = new DialogWindow<T>();

        dialog.entry = entry();
        dialog.setCaption(dialog.entry.caption);

        dialog.buttons = buttons();
        dialog.callback = callback;

        dialog.createForm();

        dialog.show();
    }

    export function showAbout() {
        showDialog<any>(() => new EntryAbout(),
            () => okButton(), 0);
    }

    export function showOk(message: string, callback?: (name: string, data: string) => void) {
        showDialog<string>(() => new EntryLabel(message, "Info", "icon/48/status/dialog-information.png"),
                () => okButton(), 0, callback);
    }

    export function showError(message: any, callback?: (name: string, data: string) => void) {
        showDialog<string>(() => new EntryLabel(message, "Error", "icon/48/status/dialog-error.png"),
                () => okButton(), 0, callback);
    }

    export function showWarning(message: string, callback?: (name: string, data: string) => void) {
        showDialog<string>(() => new EntryLabel(message, "Warning", "icon/48/status/dialog-warning.png"),
                () => okButton(), 0, callback);
    }

    export function showOkCancel(message: string, callback?: (name: string, data: string) => void) {
        showDialog<string>(() => new EntryLabel(message, "Confirm", "icon/48/status/dialog-warning.png"),
                () => okCancelButtons(), 0, callback);
    }

    export function showYesNo(message: string, callback?: (name: string, data: string) => void) {
        showDialog<string>(() => new EntryLabel(message, "Confirm", "icon/48/status/dialog-warning.png"),
                () => [
                    { caption: "Yes", color: ColorType.Success },
                    { caption: "No", color: ColorType.Warning }
                ], 1, callback);
    }

    export function showText(prompt: string, defValue: string, minWidth: number = 100) {
        showDialog<string>(() => new EntryText(prompt, "Info", defValue, minWidth, true),
            () => okButton(), 1);
    }

    export function inputText(prompt: string, defValue: string, minWidth: number = 100, callback: (d: string) => void = null): void {
        showDialog<string>(() => new EntryText(prompt, "Input", defValue, minWidth, false),
            () => okCancelButtons(), 1, (n, d) => {
                if (n === "ok") {
                    if (callback) {
                        callback(d);
                    }
                }
            });
    }

    export function okButton(): ButtonData[]{
        return [{ caption: "OK", color: ColorType.Info }];
    }

    export function okCancelButtons(): ButtonData[]{
        return [{ caption: "OK", color: ColorType.Success },
                { caption: "Cancel", color: ColorType.Warning }];
    }

    class EntryLabel extends EntryBase<string> {
        constructor(message: string, caption: string, icon: string) {
            super();
                       
            this.setLayout(new qx.ui.layout.HBox(10));
            this.caption = caption;

            this.add(new qx.ui.basic.Image(icon));

            var msg = new qx.ui.basic.Label(message);
            msg.setRich(true);
            msg.setMaxWidth(window.innerWidth * 2/3);
            // msg.setAllowStretchX(true, true);
            this.add(msg, { flex: 1 });
        }
    }

    class EntryText extends EntryBase<string> {
        entry: qx.ui.form.TextField;

        constructor(message: string, caption: string, defValue: string, minWidth: number = 100, readOnly: boolean = false) {
            super();

            var layout = new qx.ui.layout.VBox(10);
            this.setLayout(layout);

            this.caption = caption;

            var msg = new qx.ui.basic.Label(message);
            this.add(msg);

            this.entry = new qx.ui.form.TextField();
            this.entry.setReadOnly(readOnly);
            this.entry.setMinWidth(minWidth);
            this.entry.setValue(defValue);
            this.entry.setAllowStretchX(true, true);
            this.add(this.entry, { flex: 1 });
        }

        getData(): string {
            return this.entry.getValue();
        }

        setData() {
        }
    }
}
