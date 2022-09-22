/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

/*
    Code simmilar to this included in the Phoenix Software International product (E)JES Web
    in the outer closure.  It utilized the global _app.  The code is run each time the
    web app displays a new page, and it works with the code in index.html to connect.
    The unrestricted postMessage on the "zowe handle" is then used to communicate to
    the Zowe host in index.html.  Examine both this file and index.html to see
    how the two pieces of code handshake.  The index.html file has been further
    modified to read in persistence information. 
*/

    /**
     * Closure variables and functions
    */

    /* app data */

    var _app = {};

    /* Other variable definitions would go here. */

    // Zowe-Listener: Called sometime after index.html loads in a Zowe iframe (if ever).
    if ( window.self !== window.top ) // Don't install Zowe listener unless in an iframe.
        $(window).on('message onmessage', function (e) {
            // Do we trust the sender of this message?
            var event = e.originalEvent; // https://stackoverflow.com/questions/9904490/jquery-doesnt-support-postmessage-event
            _log('clientZlux01D: Origin is ' + event.origin + '.  Data is ' + JSON.stringify(event.data) + '".');

            if ( ! _app.zowe ) {
                _app.zowe = { 
//                    configuredZluxOrigin: 'https://mvs60.phx.phoenixsoftware.com:8544', // TODO: From persistence data on host.
                    configuredZluxOrigin: 'https://mvs70.phx.phoenixsoftware.com:7556', // TODO: From persistence data on host.
                    isZowefied: false,
                    zoweHandle: null,
                    key: 'ZoweTabData',
                    token: 'zoweZluxEL'
                }
                if (event.origin !== _app.zowe.configuredZluxOrigin) {
                    _log('clientZlux03E: Message of unconfigured origin rejected: "' + event.origin + '"');
                    _app.zowe = undefined
                    return;
                }    
                if ( event.data.token == _app.zowe.token && event.data.verb == 'intialize' || event.data.verb == 'refresh' ) {
                    _log('clientZlux04I: (E)JES Web running under Zowe.  Connector initialized.  Zowe handle set. ' + event.data.message );
                    event.source.postMessage('ejesweb', event.origin);
                    _app.zowe.isZowefied = true;
                    _setSessionStorage(_app.zowe.key, JSON.stringify(_app.zowe));
                    _app.zowe.zoweHandle = event.source; // Handle cannot be included is local storage.  Zowe posts this regularly to us.
                }
                else {
                    _log('clientZlux05E: Connect attempt with incorrect token rejected.');
                    _app.zowe = undefined
                }
            return;
            }

            if (event.origin !== _app.zowe.configuredZluxOrigin) {
                _log('clientZlux07E: Message of unconfigured origin rejected: "' + event.origin + '"');
                return;
            }
            // "Assuming you've verified the origin of the received message (which
            // you must do in any case), a convenient idiom for replying to a
            // message is to call postMessage on event.source and provide
            // event.origin as the targetOrigin."
            if ( event.data.message != 'refresh' )
                _log('clientZlux08D: Processing Zowe verb ' + event.data.verb + ' with "' + event.data.message + '" message.');
        });

    /**
     * @memberOf outerClosure
     */
     function _zoweConfigurationRequestor() {
        _log('clientZlux09I: Zowe Configuration Requestor');
        document.getElementById('webapp').setAttribute('style', 'display:none');
        _app.zowe.zoweHandle.postMessage('configureZowe', _app.zowe.configuredZluxOrigin);
    }

    /* The rest of the web app follows. */

