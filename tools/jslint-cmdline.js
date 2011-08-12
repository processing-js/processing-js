function runJslint(input) {
    var e, i;
    // input will come from the env via python
    if (!JSLINT(input, {
        predef: { 
          ImageData: true,
          CanvasRenderingContext2D: true,
          Float32Array: true,
          Int32Array: true,
          Uint16Array: true,
          Uint8Array: true,
          DOMParser: true,
          window: true,
          localStorage: true,
          HTMLCanvasElement: true,
          HTMLImageElement: true
        },
        evil: true,
        undef: true,
        eqeqeq: true,
        newcap: false,
        immed: true,
        indent: 2,
        browser: true,
        sub: true,        
        eqeqeq: true,
        immed: true,
        newcap: true,
        /*
        forvar: true,
        bitwise: true,
        nomen: true,
        onevar: true,
        plusplus: true,
        regexp: true,
        rhino: true,
        undef: true,
        white: true
        */
    })) {
        for (i = 0; i < JSLINT.errors.length; i += 1) {
            e = JSLINT.errors[i];
            if (e) {
                print('Lint at line ' + e.line + ' character ' + e.character + ': ' + e.reason);
                print((e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
                print('');
            }
        }
    } else {
        print("jslint: No problems found");
    }
}
