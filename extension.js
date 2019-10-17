const ExtensionUtils = imports.misc.extensionUtils;
const Meta = imports.gi.Meta;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Shell = imports.gi.Shell;
const GObject = imports.gi.GObject;

const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const AudioOutputSubMenu = GObject.registerClass(
	class AudioOutputSubMenu extends PopupMenu.PopupSubMenuMenuItem {
	_init() {
		super._init("Audio Output: Connecting...", true);
		this._control = Main.panel.statusArea.aggregateMenu._volume._control;

		this._controlSignal = this._control.connect('default-sink-changed', () => {
			if (this._updateDefaultSink) {
				this._updateDefaultSink();
			}
		});
		this._updateDefaultSink();
		this.menu.connect('open-state-changed', (menu, isOpen) => {
			if (isOpen)
				this._updateSinkList();
		});
		//Unless there is at least one item here, no 'open' will be emitted...
		let item = new PopupMenu.PopupMenuItem('Connecting...');
		this.menu.addMenuItem(item);
	}

	_updateDefaultSink() {
		let defsink = this._control.get_default_sink();
		//Unfortunately, Gvc neglects some pulse-devices, such as all "Monitor of ..."
		if (!defsink)
			this.label.set_text("Other");
		else
			this.label.set_text(defsink.get_description());
	}

	_updateSinkList() {
		this.menu.removeAll();

		let defsink = this._control.get_default_sink();
		let sinklist = this._control.get_sinks();
		let control = this._control;

		for (let i=0; i<sinklist.length; i++) {
			let sink = sinklist[i];
			if (sink === defsink)
				continue;
			let item = new PopupMenu.PopupMenuItem(sink.get_description());
			item.connect('activate', () => {
				control.set_default_sink(sink);
			});
			this.menu.addMenuItem(item);
		}
		if (sinklist.length == 0 ||
			(sinklist.length == 1 && sinklist[0] === defsink)) {
			item = new PopupMenu.PopupMenuItem("No more Devices");
			this.menu.addMenuItem(item);
		}
	}

	destroy() {
		this._control.disconnect(this._controlSignal);
		super.destroy();
	}
});

let sinkIndex = 0;
let settings = null;
let audioOutputSubMenu = null;

function init () {
	sinkIndex = 0;
	settings = Utils.getSettings();
}

function enable () {
	if (audioOutputSubMenu) {
		return;
	}
	audioOutputSubMenu = new AudioOutputSubMenu();

	//Try to add the output-switcher right below the output slider...
	let volMen = Main.panel.statusArea.aggregateMenu._volume._volumeMenu;
	let items = volMen._getMenuItems();
	let i = 0;
	while (i < items.length)
		if (items[i] === volMen._output.item)
			break;
		else
			i++;
	volMen.addMenuItem(audioOutputSubMenu, i+1);

	//Add keyboard shortcut for fast switching

	let keyBindingMode = null;
	if (Shell.ActionMode) {
		//KeyBindingMode was renamed to ActionMode in Gnome 3.15.3
		keyBindingMode = Shell.ActionMode.ALL;
	} else {
		keyBindingMode = Shell.KeyBindingMode.ALL;
	}

	Main.wm.addKeybinding("switch-next-audio-output",
		settings,
		Meta.KeyBindingFlags.NONE,
		keyBindingMode,
		function(display, screen, window, binding) {

			let control = Main.panel.statusArea.aggregateMenu._volume._control;
			let sinklist = control.get_sinks();

			if (sinklist.length === 0) {
				return;
			}
			sinkIndex++
			if (sinkIndex >= sinklist.length) {
				sinkIndex = 0
			}
			let sink = sinklist[sinkIndex];
			control.set_default_sink(sink);
		}
	);
}

function disable () {
	audioOutputSubMenu.destroy();
	audioOutputSubMenu = null;
}
