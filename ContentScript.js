chrome.runtime.onConnect.addListener(function (port) {

    port.onMessage.addListener(
        function (request, sender) {
            console.log(request);
            let url = request.url;
            let retail_1 = new RegExp('merchantos.com', 'gi');
            let retail_2 = new RegExp('lightspeedapp.com', 'gi');
            let reports = new RegExp('form_name=ui_tab\&tab=reports', 'g');

            if (request.type == "script") {
                if (request.settings.UKVatReport.active && (retail_1.test(url) || retail_2.test(url))) {
                    if (reports.test(url)) {
                        console.log(`Let's report these Taxes`);
                        port.postMessage({
                            script: "UKVatReport",
                            run: request.settings.UKVatReport.active
                        });
                    }
                }
                if (!request.settings.UKVatReport.active) {
                    port.postMessage({
                        script: "none",
                        run: false
                    });
                }
            } else {
                
                port.postMessage({
                    script: "Else Case - Nothing to see here",
                    run: false
                });
            }
        }

    )
    window.addEventListener("message", function(event) {
        // We only accept messages from ourselves
        if (event.source != window)
          return;
      
        if (event.data.type && (event.data.type == "FROM_PAGE")) {
          console.log("The Params recieved are: ", event.data.payload);
          port.postMessage(event.data);
        }
        if (event.data.type && (event.data.type == "ANALYTICS")) {
            console.log("The Params recieved are: ", event.data.payload);
            port.postMessage(event.data);
          }
        
      }, false);
});