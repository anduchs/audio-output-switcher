const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

const AudioOutputSubMenu = new Lang.Class({
    Name: 'AudioOutputSubMenu',
    Extends: PopupMenu.PopupSubMenuMenuItem,

    _init: function() {
        this.parent('Audio Output: Connecting...', true);

        this._control = Main.panel.statusArea.aggregateMenu._volume._control;
        
        this._control.connect('default-sink-changed', Lang.bind(this, function() {
            this._updateDefaultSink();
        }));
        
        this._updateDefaultSink();

        this.menu.connect('open-state-changed', Lang.bind(this, function(menu, isOpen) {
            if (isOpen)
                this._updateSinkList();
        }));
        
        //Unless there is at least one item here, no 'open' will be emitted...
        item = new PopupMenu.PopupMenuItem('Connecting...');
        this.menu.addMenuItem(item);
    },
    
    _updateDefaultSink: function () {
        this.label.set_text(this._control.get_default_sink().get_description());
    },
    
    _updateSinkList: function () {
        this.menu.removeAll();

        sinklist = this._control.get_sinks();
        control = this._control;

        for (i = 0; i < sinklist.length; i++) {
            sink = sinklist[i];
            item = new PopupMenu.PopupMenuItem(sink.get_description());
            item.connect('activate', Lang.bind(sink, function() {
                control.set_default_sink(this);
            }));
            this.menu.addMenuItem(item);
        }
    },
});

let audioOutputSubMenu = null;

function init() {
}

function enable() {
    if (audioOutputSubMenu != null)
        return;
    audioOutputSubMenu = new AudioOutputSubMenu();
    Main.panel.statusArea.aggregateMenu._volume.menu.addMenuItem(audioOutputSubMenu);
}

function disable() {
    audioOutputSubMenu.destroy();
    audioOutputSubMenu = null;
}
