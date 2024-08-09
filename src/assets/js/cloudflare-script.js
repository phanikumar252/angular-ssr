function addClouflare() {

    console.log("cloud flare 1")
    var elementRef = document.getElementsByClassName("cf-turnstile-container")

    if (elementRef) {
        elementRef[0].setAttribute("id", "turnstile-container")
        turnstile.ready(function () {
            turnstile.render('#turnstile-container', {
                // sitekey: '0x4AAAAAAARRvW2fXS_jZ86H', //Prod
                sitekey: '0x4AAAAAAAfQmVum200WsXKz', //QA
                callback: async function (token) {
                    console.log(`Challenge Success ${token}`);
                    let obj = {
                        token,
                        // secret: "0x4AAAAAAARRvcTBvGBFu9emFB9gvlD1h3Y" //prod
                        secret: "0x4AAAAAAAfQmTVdiKl7fTgxwYKXMxcMbNw" //qa

                    }
                    // formData.append('secret', "0x4AAAAAAAR-XZXd7d7O5vMC8XO9zvRP_gI");
                    // formData.append('response', token);
                    // http://localhost:3003
                    // https://server-app-anvil.onrender.com
                    // console.log(JSON.stringify(formData), 'formData')
                    const result = await fetch('https://server-app-anvil.onrender.com/sitesVerify', {
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(obj),
                        method: 'POST',
                    });
                    // console.log(res, "vvv")
                    const outcome = await result.json();
                    console.log(outcome, "vvv", result)
                    // if (!outcome.success) {
                    //     return new Response('The provided Turnstile token was not valid! \n' + JSON.stringify(outcome));
                    // }
                    // // The Turnstile token was successfuly validated. Proceed with your application logic.
                    // // Validate login, redirect user, etc.
                    // // For this demo, we just echo the "/siteverify" response:
                    // return new Response('Turnstile token successfuly validated. \n' + JSON.stringify(outcome));
                },
                errorCallback: function () {

                },
                appearance: "execute"
            });
        });
    }
    else {
        addClouflare()
    }
}
addClouflare()
// window.addEventListener('load', function () {
//     addClouflare()
// })