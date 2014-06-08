const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Gvc = imports.gi.Gvc;

const AudioOutputSubMenu = new Lang.Class({
	Name: 'AudioOutputSubMenu',
	Extends: PopupMenu.PopupSubMenuMenuItem,

	_init: function() {
		this.parent('Connecting...', true);

		this._entries = {};
		this._numEntries = 0;
		this._activeEntry = null;

		this._emptyItem = new PopupMenu.PopupMenuItem("No more Devices...");
		this.menu.addMenuItem(this._emptyItem);

		//this._control = Main.panel.statusArea.aggregateMenu._volume._control;

		this._control = new Gvc.MixerControl({ name: 'AudioOutputSwitcher' });
		this._control.open();

		//No population of submenu necessary.
		//MixerControl sends events for all devices on connect as it seems.
		//Same is true for active output... Therefore this order of connections here...

		this._sig1 = this._control.connect('output-added', Lang.bind(this, function(control, id) {
			this._outputAdded(id);
		}));

		this._sig2 = this._control.connect('output-removed', Lang.bind(this, function(control, id) {
			this._outputRemoved(id);
		}));

		this._sig3 = this._control.connect('active-output-update', Lang.bind(this, function(control, id) {
			this._outputUpdate(id);
		}));
	},

	_outputUpdate: function (id) {
		if (this._activeEntry != null)
			this._activeEntry.actor.show();
		let output = this._control.lookup_output_id(id);
		if (output == null) {
			this.label.set_text("Unknown Device");
			return;
		}
		this.label.set_text(output.get_description() + " - " + output.get_origin());
		this._activeEntry = this._entries["ID"+id];
		if (this._activeEntry != null)
			this._activeEntry.actor.hide();		
	},

	_outputAdded: function (id) {
		let output = this._control.lookup_output_id(id);
		if (output == null) {
			return;
		}
		let item = new PopupMenu.PopupMenuItem(output.get_description() + " - " + output.get_origin());
		item.connect('activate', Lang.bind(this, function() {
			this._control.change_output(output);
		}));
		this.menu.addMenuItem(item);
		this._entries["ID"+id] = item;
		this._numEntries++;
		if ((this._activeEntry == null && this._numEntries > 0) || this._numEntries > 1)
			this._emptyItem.actor.hide();
		else
			this._emptyItem.actor.show();
	},

	_outputRemoved: function (id) {
		let item = this._entries["ID"+id];
		if (item == null)
			return;
		item.destroy();
		this._numEntries--;
		if ((this._activeEntry == null && this._numEntries > 0) || this._numEntries > 1)
			this._emptyItem.actor.hide();
		else
			this._emptyItem.actor.show();
	},

	destroy: function() {
		if (this._control == null) {
			this.parent();
			return;
		}

		if (this._sig1)
			this._control.disconnect(this._sig1);
		if (this._sig2)
			this._control.disconnect(this._sig2);
		if (this._sig3)
			this._control.disconnect(this._sig3);
		this._control.close();

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
