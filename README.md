Gnome-Shell Extension Audio-Output-Switcher
===========================================

This extension adds a little entry to the status-menu that shows the currently
selected pulse-audio-output device. Clicking on that will open a submenu with
all available output devices and let's you choose which one to use.

Since version 5, it also provides a shortcut to quickly switch input sources: 
`<Super>`+`q`

Most importantly this extension is as simple as possible. Therefore it does not
include an input switcher or similar.
See Audio-Input-Switcher (https://github.com/adaxi/audio-input-switcher)
extension for microphone selection.

Install
-------

Either via 

    https://extensions.gnome.org

or via

    git clone https://github.com/adaxi/audio-output-switcher.git ~/.local/share/gnome-shell/extensions/audio-output-switcher@anduchs

Then resart the gnome-shell via `CTRL+F2` then `r` and enable the extension using gnome-tweak-tool

To update later, just issue

    (cd ~/.local/share/gnome-shell/extensions/audio-output-switcher@anduchs && git pull)
    
Credits
-------

Originally authored by @anduchs.

