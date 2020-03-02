# webrun-plugin-dat
A plugin for webrun that enables support for the Dat protocol.

## How to use

```bash
# Install webrun
npm i -g webrun

# Install the Dat plugin
npm i -g webrun-plugin-dat

# Run a module off of Dat
webrun dat://rangermauve.hashbase.io/example.js
```

This plugin also adds the `window.DatArchive` global to all scripts which enables you to create and load archives.
Check out the API [here](https://github.com/datproject/sdk#api-promise).

If you're loading a script off of Dat, you can access the [window.experimental.datPeers](https://beakerbrowser.com/docs/apis/experimental-datpeers) API if you've enabled it for that archive.
This enables you to send messages to other processes that are replicating that archive.
