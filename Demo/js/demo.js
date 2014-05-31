var canvas, ctx, ec,

sample = 'full'; // <-- Change this to 'simple' for the simple demo

function init() {

    // Get the canvas object
	canvas = document.getElementsByTagName('canvas')[0];

    // Fullscreen the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

    // Extend the canvas
	ec = canvelope.enhance(canvas);

    startDemo();
}

function startDemo () {
    var demoName = 'demo_' + sample;
    if (window[demoName]) window[demoName]();
}

function demo_simple () {

    var firstEl = ec.createElement('RECTANGLE', {
        top: 100,
        left: 50,
        opacity: 0.5,
        width: 100,
        height: 100,
        background: 'rgba(30, 30, 200, 0.7)',
        borderColor: 'rgba(30, 30, 100, 0.8)',
        borderWidth: 5,
        scale: 0.2
    });

    firstEl.child_1 = firstEl.createElement('RECTANGLE', {
        width: 40,
        height: 40,
        top: '10%',
        left: '100%',
        //rotation: 45,
        background: 'rgba(5, 5, 40, 0.8)'
    });

    firstEl.child_2 = firstEl.createElement('CIRCLE', {
        width: 20,
        height: 20,
        top: 60,
        left: 30,
        background: 'rgba(5, 5, 40, 0.8)'
    });

    firstEl.child_1.child_1 = firstEl.child_1.createElement('RECTANGLE', {
        width: 20,
        height: 20,
        top: 0,
        left: 0,
        background: 'rgba(200, 30, 30, 1)'
    })

    firstEl.child_1.animate({ rotation: 300 }, 500, function () {
        this.parent.animate({ scale: 1, top: 300, left: 600, width: 300, height: 300, rotation: 360, opacity: 0.6 }, 15000);
    });
}

function demo_full () {

    function c () {
        return Math.round(Math.random() * 255);
    }

    var instance = 1;

    function anim(el) {
        setTimeout(function () {
            el.animate({
                top: Math.random() * canvas.height,
                left: Math.random() * canvas.width,
                rotation: Math.random() > 0.25 ? Math.random() > 0.5 ? Math.random() > 0.75 ? 45 : 90 : 180 : 0
            }, 5000);
        }, 100 * instance++);
    }

    for (var i = 0; i < 600; i++ ) {
        var color = 'rgba(' + c() + ',' + c() + ',' + c() + ',';
        var el = ec.createElement(Math.random() > 0.5 ? 'CIRCLE' : 'RECTANGLE', {
                top: Math.random() * canvas.height,
                left: Math.random() * canvas.width,
           width: Math.round(6 + Math.random() * 30),
           height: Math.round(6 + Math.random() * 30),
           opacity: 1,
           background: color + '0.9)',
           border_color: color + '1)'
        });

        anim(el);
    }
}

this.addEventListener('DOMContentLoaded', init);