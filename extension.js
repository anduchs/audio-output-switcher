const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

const AudioOutputSubMenu = new Lang.Class({
	Name: 'AudioOutputSubMenu',
	Extends: PopupMenu.PopupSubMenuMenuItem,

	_init: function() {
		this.parent('Audio Output: Connecting...', true);

		this._control = Main.panel.statusArea.aggregateMenu._volume._control;

		this._controlSignal = this._control.connect('default-sink-changed', Lang.bind(this, function() {
			this._updateDefaultSink();
		}));

		this._updateDefaultSink();

		this.menu.connect('open-state-changed', Lang.bind(this, function(menu, isOpen) {
			if (isOpen)
				this._updateSinkList();
		}));

		//Unless there is at least one item here, no 'open' will be emitted...
		let item = new PopupMenu.PopupMenuItem('Connecting...');
		this.menu.addMenuItem(item);
	},

	_updateDefaultSink: function () {
		defsink = this._control.get_default_sink();
		//Unfortunately, Gvc neglects some pulse-devices, such as all "Monitor of ..."
		if (defsink == null)
			this.label.set_text("Other");
		else
			this.label.set_text(defsink.get_description());
	},

	_updateSinkList: function () {
		this.menu.removeAll();

		let defsink = this._control.get_default_sink();
		let sinklist = this._control.get_sinks();
		let control = this._control;

		for (let i=0; i<sinklist.length; i++) {
			let sink = sinklist[i];
			if (sink === defsink)
				continue;
			let item = new PopupMenu.PopupMenuItem(sink.get_description());
			item.connect('activate', Lang.bind(sink, function() {
				control.set_default_sink(this);
			}));
			this.menu.addMenuItem(item);
		}
		if (sinklist.length == 0 ||
			(sinklist.length == 1 && sinklist[0] === defsink)) {
			item = new PopupMenu.PopupMenuItem("No more Devices");
			this.menu.addMenuItem(item);
		}
	},

	destroy: function() {
		this._control.disconnect(this._controlSignal);
		this.parent();
	}
});

let audioOutputSubMenu = null;

function init() {
}

function enable() {
	if (audioOutputSubMenu != null)
		return;
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
}

function disable() {
	audioOutputSubMenu.destroy();
	audioOutputSubMenu = null;
}
