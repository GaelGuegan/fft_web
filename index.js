
var fourier_transf = function(p)
{
	p.setup = function()
	{
		width = 1024;
		height = 600;
		canvas = p.createCanvas(width, height);
		canvas.parent('fourier_transf');
		canvas.style('border', '2px solid');
		canvas.style('position', 'relative');
		canvas.style('display', 'block');
		canvas.style('visibility', 'visible');

		f1 = document.getElementById('function1');
		f1.addEventListener("change", update_function1);
		f1.value ='sinus';

		f2 = document.getElementById('function2');
		f2.addEventListener("change", update_function2);
		f2.value ='sinus';

		freq = document.getElementById('freq');
		amp = document.getElementById('amp');
		phase = document.getElementById('phase');
		noise = document.getElementById('noise');
		fourier_mag = document.getElementById("fourier_mag");
		fourier_real = document.getElementById("fourier_real");
		fourier_imags = document.getElementById("fourier_imag");

		freq.addEventListener("change", update_function1);
		amp.addEventListener("change", update_function1);
		phase.addEventListener("change", update_function1);
		noise.addEventListener("change", update_noise);

		s1 = sinus(0, width, amp.value, 1/freq.value, parseFloat(phase.value));
		s2 = cosinus(0, width, amp.value, 2/freq.value, parseFloat(phase.value));
		sn = noisy(0, width, noise.value, amp.value);
		s = add(s1, s2);
		s = add(s, sn);

    p.frameRate(10);

		var input = new Float32Array(1024);
		for (let i = 0; i < s.length;i++){
			input[i] = s[i][1];
		}
  
		fft = new FFT(s.length, 44100);
    S = fft.forward(input);
    S = fft.spectrum;

		/*var input = [];
		for (let i = 0; i < s.length;i++){
			input[i] = s[i][1];
		}*/

	}

	p.draw = function()
	{
		p.background(255, 255, 255);
		p.line(0, height/2, width, height/2);

	  sn = noisy(0, width, noise.value, amp.value);
		s = add(s1, s2);
		s = add(s, sn);

		var input = new Float32Array(1024);
		for (let i = 0; i < s.length;i++){
			input[i] = s[i][1];
		}
  
    S = fft.forward(input);
    S = fft.spectrum;

		display_axes(10, height/4, width, height/2, 0.05);
		display_axes(10, height*3/4, width, height/2, 0.05);

		display_function(s, 12, height/4);
		display_function(S, 12, height*3/4);

    //display_abs(S, 10, height*3/4);
		/*if (fourier_mag.checked) {
			display_abs(S, 10, height*3/4);
		}
		if (fourier_real.checked) {
			display_real(S, 10, height*3/4);
		}
		if (fourier_imag.checked) {
			display_im(S, 10, height*3/4);
		}*/
	}

	function update_function1() {
		document.getElementsByName("freq_value")[0].value = freq.value;
		document.getElementsByName("amp_value")[0].value = amp.value;
		document.getElementsByName("phase_value")[0].value = phase.value;
		document.getElementsByName("noise_value")[0].value = noise.value;
		switch (f1.value) {
			case "cosinus":
				s1 = cosinus(0, width, amp.value, 1/freq.value, parseFloat(phase.value));
				break;
			case "sinus":
				s1 = sinus(0, width, amp.value, 1/freq.value, parseFloat(phase.value));
				break;
			case "porte":
				s1 = porte(0, width, amp.value, width*3/4, 0);
				break;
			case "sinus cardinal":
				s1 = sinc(0, width, amp.value, width*3/4, 100);
				break;
			default:
				s1 = [];
				for (let i = 0; i < 100; i++) {
					s1[i] = eval(document.getElementById('function1').value);
				}
		}
		s = add(s1, s2);
		s = add(s, sn);
		//S = dft(s);
	}

	function update_function2() {
		switch (f2.value) {
			case "cosinus":
				s2 = cosinus(0, width, amp.value, 1/freq.value, parseFloat(phase.value));
				break;
			case "sinus":
				s2 = sinus(0, width, amp.value, 1/freq.value, parseFloat(phase.value)); 
				break;
			case "porte":
				s2 = porte(0, width, amp.value, width*3/4, 0);
				break;
			case "sinus cardinal":
				s2 = sinc(0, width, width/4, width*3/4, 100);
				break;
			default:
				s2 = [];
				for (let i = 0; i < 100; i++) {
					s2[i] = eval(document.getElementById('function2').value);
				}
		}
		s = add(s1, s2);
		s = add(s, sn);
		//S = dft(s);
	}

  function update_noise() {
		document.getElementsByName("noise_value")[0].value = noise.value;
    sn = noisy(0, width, noise.value, amp.value);
		s = add(s1, s2);
		s = add(s, sn);
  }

	function add(sig1, sig2) {
		Sig = [];

		for (let i = 0; i < sig1.length; i++) {
			Sig[i] = [i, sig1[i][1] + sig2[i][1]];
		}

		return Sig;
	}

  function mult(sig1, sig2) {
		Sig = [];

		for (let i = 0; i < sig1.length; i++) {
			Sig[i] = [i, sig1[i][1] * sig2[i][1]];
		}

		return Sig;
	}

	function cosinus(min, max, amp, freq, phi) {
		var f = [];

		for (let i = 0; i < max-min;i++){
			f[i] = [min + i, amp * p.cos(2 * p.TWO_PI * freq * (i+min) + phi)];
		}

		return f;
	}

	function sinc(min, max, amp, freq, phi) {
		var f = [];

		for (let i = 0; i < max-min;i++){
			f[i] = [min + i, amp * p.sin(2 * p.TWO_PI * freq * (i+min) + phi)/(i+min)];
		}

		return f;
	}

	function noisy(min, max, val, amp) {
		var f = [];

		for (let i = 0; i < max-min;i++){
			f[i] = [min + i, amp * val * p.random(-1, 1)];
		}

		return f;
	}

	function porte(minX, maxX, minY, maxY, amp) {
		var f = [];

		for (let i = 0; i < maxX-minX; i++) {
			if (i >= minY && i <= maxY) {
				f[i] = [minX+i, amp];
			} else {
				f[i] = [minX+i, 0];
			}
		}

		return f;
	}

	function sinus(min, max, amp, freq, phi) {
		var f = [];

		for (let i = 0; i < max-min;i++){
			f[i] = [min + i, amp * p.sin(2 * p.TWO_PI * freq * (i+min) + phi)];
		}

		return f;
	}

	function display_axes(Ox, Oy, w, h, rate) {
		p.strokeWeight(0.5);
		p.translate(Ox, Oy);
		p.line(0, 0, w, 0);
		p.line(0, -h/2, 0, h/2);
		for (let i = 0; i < w * rate; i++) {
			p.line(i/rate, -5, i/rate, 5);
		}
		for (let i = 0; i < h * rate; i++) {
			p.line(-5, -h/2 + i/rate, 5, -h/2 + i/rate);
		}
		p.strokeWeight(1);
		p.resetMatrix();
	}

	function display_function(f, Ox, Oy) {
		p.translate(Ox, Oy);
		p.scale(1, -1);
    if (f[0].length == 2) {
      for (let i = 0; i < f.length-1; i++) {
        p.line(f[i][0], f[i][1], f[i+1][0], f[i+1][1]);
      }
    } else {
      for (let i = 0; i < f.length-1; i++) {
        p.line(i, f[i], i+1, f[i+1]);
      }
    }

		p.resetMatrix();
	}

	function display_real(f, Ox, Oy, stroke="green") {
		p.translate(Ox, Oy);
		p.scale(1, -1);
		p.stroke(stroke);
		for (let i = 0; i < f.length-1; i++) {
			p.line(i, math.re(f[i]), i+1, math.re(f[i+1]));
		}
		p.resetMatrix();
		p.stroke("black");
	}

	function display_im(f, Ox, Oy, stroke="red") {
		p.translate(Ox, Oy);
		p.scale(1, -1);
		p.stroke(stroke);
		for (let i = 0; i < f.length-1; i++) {
			p.line(i, math.im(f[i]), i+1, math.im(f[i+1]));
		}
		p.resetMatrix();
		p.stroke("black");
	}

	function display_abs(f, Ox, Oy, stroke="black") {
		p.translate(Ox, Oy);
		p.scale(1, -1);
		p.stroke(stroke);
		for (let i = 0; i < f.length-1; i++) {
			p.line(i, math.abs(f[i]), i+1, math.abs(f[i+1]));
		}
		p.resetMatrix();
		p.stroke("black");
	}
}

var canvas_1 = new p5(fourier_transf);