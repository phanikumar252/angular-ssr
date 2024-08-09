// // "use strict";
// // $( document ).ready(function() {
    
// (function() {

//     var x;
//     var offsetX, offsetY;
    
//     window.addEventListener('message', function (event) {
//         //   console.log(window.location.pathname); // Message received from child
//         //   if(event.data == true){
//         //     document.getElementById("iFrameDiv")
//         //   }
//         x = document.getElementById('iFrameDiv');
//         let b = document.body
//         let blurdiv = document.getElementById('blur-background')
//         var chtbtStatus = localStorage.getItem("showchatbot");
//         // console.log("showchatbot", chtbtStatus)
//         var careerStatus = localStorage.getItem("showcareer");
//         var highVolumeStatus = (localStorage.getItem("highVolume") && localStorage.getItem("highVolume")=='true') ? true : false;
//         // console.log("careerStatus", careerStatus)
//         if (careerStatus && careerStatus == "true" && chtbtStatus && chtbtStatus == "true" && (window.location.pathname.indexOf('find-jobs') !== -1)) {
//             x.style.display = 'block';
//             // console.log(123);
//             if (event.data === true) {
//                 // x.style.height = '80vh'
//                 // x.style.height = ((window.innerWidth >= 1540) || ((window.innerWidth >= 768) && (window.innerWidth <= 1024))) ? '50vh' : '80vh';
//                 if (window.innerWidth >= 1540) {
//                     x.style.height = '50%'
//                 } else if ((window.innerWidth <= 1539) && (window.innerWidth >= 1024)) {
//                     x.style.height = '80%'
//                 } else if ((window.innerWidth <= 1023) && (window.innerWidth >= 768)) {
//                     x.style.height = '60%'
//                 } else {
//                     x.style.height = '100%'
//                 }
    
//                 x.style.width = (window.innerWidth > 600) ? '350px' : '100%';
//                 b.style.overflow = 'hidden';
//                 b.style.margin = '0px';
//                 blurdiv.style.display = 'block';
//             } else if (event.data == false) {
//                 x.style.height = '94px';
//                 x.style.width = '94px';
//                 b.style.overflow = 'auto';
//                 blurdiv.style.display = 'none';
//             }
    
//         } else {
//             x.style.display = 'none';
//         }
    
//         // x.addEventListener("mousedown", handleMouseDown);
//         // x.addEventListener("touchstart", handleTouchStart);
//     });
    
//     })();
// "use strict";
// $( document ).ready(function() {
    
(function() {

    var x;
    var offsetX, offsetY;
    
    window.addEventListener('message', function (event) {
        //   console.log(window.location.pathname); // Message received from child
        //   if(event.data == true){
        //     document.getElementById("iFrameDiv")
        //   }
        x = document.getElementById('iFrameDiv');
        let b = document.body
        let blurdiv = document.getElementById('blur-background')
        var chtbtStatus = localStorage.getItem("showchatbot");
        var jobOpenStatus = localStorage.getItem("jobOpen")
        // console.log("showchatbot", chtbtStatus)
        var careerStatus = localStorage.getItem("showcareer");
        var highVolumeStatus = (localStorage.getItem("highVolume") && localStorage.getItem("highVolume")=='true') ? true : false;
        // console.log("careerStatus", careerStatus)
        if (jobOpenStatus != "true" && careerStatus && careerStatus == "true" && chtbtStatus && chtbtStatus == "true" && ((window.location.pathname.indexOf('jobs/') !== -1) || (window.location.pathname.indexOf('bms-find-jobs') !== -1) || (window.location.pathname.indexOf('bms-find-jobs-one') !== -1) || (window.location.pathname.indexOf('bms-find-jobs-two') !== -1) || (window.location.pathname.indexOf('bms-find-jobs-three') !== -1) || (window.location.pathname.indexOf('bms-find-jobs-four') !== -1) || (window.location.pathname.indexOf('bms-find-jobs-five') !== -1) || (window.location.pathname.indexOf('bms-find-jobs-six') !== -1))) {
            x.style.display = 'block';
            // console.log(123);
            // console.log(event.data);
            if (event.data.bool === true || (event.data.iframeLoad && event.data.iframeLoad.indexOf("workflow") != "-1")) {
                // x.style.height = '80vh'
                // x.style.height = ((window.innerWidth >= 1540) || ((window.innerWidth >= 768) && (window.innerWidth <= 1024))) ? '50vh' : '80vh';
                if (window.innerWidth >= 1540) {
                    x.style.height = '50%'
                } else if ((window.innerWidth <= 1539) && (window.innerWidth >= 1024)) {
                    x.style.height = '80%'
                } else if ((window.innerWidth <= 1023) && (window.innerWidth >= 768)) {
                    x.style.height = '60%'
                } else {
                    x.style.height = '100%'
                }
    
                x.style.width = (window.innerWidth > 600) ? '350px' : '100%';
                b.style.overflow = 'hidden';
                b.style.margin = '0px';
                blurdiv.style.display = 'block';
            } else if (event.data.bool == false) {
                x.style.height = '94px';
                x.style.width = '94px';
                b.style.overflow = 'auto';
                blurdiv.style.display = 'none';
            }
    
        } else {
            x.style.display = 'none';
        }
    
        // x.addEventListener("mousedown", handleMouseDown);
        // x.addEventListener("touchstart", handleTouchStart);
    });
    
    })();