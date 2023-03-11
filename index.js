var s = []
var S = []

var raw = function(p)
{
	p.setup = function()
	{
		self.width = 1024;
		self.height = 300;
		canvas = p.createCanvas(self.width, self.height);
		canvas.parent('raw');
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
		fourier_image = document.getElementById("fourier_imag");

		freq.addEventListener("change", update_function1);
		amp.addEventListener("change", update_function1);
		phase.addEventListener("change", update_function1);
		noise.addEventListener("change", update_noise);

		s1 = sinus(self.width, amp.value, 1/freq.value, parseFloat(phase.value));
		s2 = cosinus(self.width, amp.value, 2/freq.value, parseFloat(phase.value));
		sn = noisy(self.width, noise.value, amp.value);
		s = add(s1, s2);
		s = add(s, sn);

		p.frameRate(10);

		var input = new Float32Array(1024);
		for (let i = 0; i < s.length;i++){
			input[i] = s[i];
		}

		fft = new FFT(s.length, 44100);
		fft.forward(input);
		S = fft.spectrum;
	}

	p.draw = function()
	{
		p.background(255, 255, 255);
		p.line(0, self.height/2, self.width, self.height/2);

		sn = noisy(self.width, noise.value, amp.value);
		s = add(s1, s2);
		s = add(s, sn);

		var input = new Float32Array(1024);
		for (let i = 0; i < s.length;i++){
			input[i] = s[i];
		}
		fft.forward(input);
		S = fft.spectrum;
		S = scalar(S, 2.8)

		display_axes(10, self.height/2, self.width, self.height/2, 0.05);
		display_function(s, 12, self.height/2);
	}

	function update_function1() {
		document.getElementsByName("freq_value")[0].value = freq.value;
		document.getElementsByName("amp_value")[0].value = amp.value;
		document.getElementsByName("phase_value")[0].value = phase.value;
		document.getElementsByName("noise_value")[0].value = noise.value;
		switch (f1.value) {
			case "cosinus":
				s1 = cosinus(self.width, amp.value, 1/freq.value, parseFloat(phase.value));
				break;
			case "sinus":
				s1 = sinus(self.width, amp.value, 1/freq.value, parseFloat(phase.value));
				break;
			case "porte":
				s1 = porte(self.width, amp.value, 1, freq.value/100 * self.width);
				break;
			case "sinus cardinal":
				s1 = sinc(self.width, 2*amp.value, 1/freq.value, parseFloat(phase.value));
				break;
			default:
				s1 = [];
				for (let i = 0; i < 100; i++) {
					s1[i] = eval(document.getElementById('function1').value);
				}
		}
		s = add(s1, s2);
		s = add(s, sn);
	}

	function update_function2() {
	switch (f2.value) {
		case "none":
			s2.fill(0, 0, self.width);
			break;
		case "cosinus":
			s2 = cosinus(self.width, amp.value, 1/freq.value, parseFloat(phase.value));
			break;
		case "sinus":
			s2 = sinus(self.width, amp.value, 1/freq.value, parseFloat(phase.value)); 
			break;
		case "porte":
			s2 = porte(self.width, amp.value, 1, freq.value/100 * self.width);
			break;
		case "sinus cardinal":
			s2 = sinc(self.width, self.width/4, self.width*3/4, 100);
			break;
		default:
			s2 = [];
			for (let i = 0; i < 100; i++) {
				s2[i] = eval(document.getElementById('function2').value);
			}
		}
		s = add(s1, s2);
		s = add(s, sn);
	}

	function update_noise() {
		document.getElementsByName("noise_value")[0].value = noise.value;
		sn = noisy(this.width, noise.value, amp.value);
		s = add(s1, s2);
		s = add(s, sn);
	}

	function scalar(sig1, value) {
		Sig = [];

		for (let i = 0; i < sig1.length; i++) {
			Sig[i] = sig1[i] * value;
		}

		return Sig;
	}

	function add(sig1, sig2) {
		Sig = [];

		for (let i = 0; i < sig1.length; i++) {
			Sig[i] = sig1[i] + sig2[i];
		}

		return Sig;
	}

	function cosinus(size, amp, freq, phi) {
		var f = [];

		for (let i = 0; i < size; i++) {
			f[i] = amp * p.cos(2 * p.PI * freq * i + phi);
		}

		return f;
	}

	function sinc(size, amp, freq, phi) {
		var f = [];
	
		f[0] = 1 * amp;
		for (let i = 1; i < size; i++) {
			//f[i] = 7 * amp * p.sin(freq * i / size) / (freq * i / (size * 2));
			x = (2 * p.PI * freq * i + phi);
			f[i] = amp * p.sin(x) / (0.03*x);
		}

		return f;
	}

	function noisy(size, val, amp) {
		var f = [];

		for (let i = 0; i < size; i++){
			f[i] = amp * p.random(-val, val);
		}

		return f;
	}

	function porte(size, amp, minX, maxX) {
		var f = [];

		for (let i = 0; i < size; i++) {
			if (i >= minX && i <= maxX) {
				f[i] = amp * 1;
			} else {
				f[i] = 0;
			}
		}

		return f;
	}

	function sinus(size, amp, freq, phi) {
		var f = [];

		for (let i = 0; i < size; i++){
			f[i] = amp * p.sin(2 * p.PI * freq * i + phi);
		}

		return f;
	}

	function display_axes(Ox, Oy, w, h, rate) {
		p.strokeWeight(0.5);
		p.translate(Ox, Oy);
		p.line(0, 0, w, 0);
		for (let i = 1; i < w * rate; i++) {
			p.line(i/rate, -5, i/rate, 5);
		}
		p.strokeWeight(1);
		p.resetMatrix();
	}

	function display_function(f, Ox, Oy) {
		p.translate(Ox, Oy);
		p.scale(1, -1);
		for (let i = 0; i < f.length-1; i++) {
			p.line(i, f[i], i+1, f[i+1]);
		}
		p.resetMatrix();
	}
}

var canvas_1 = new p5(raw);

var transfo = function (p)
{
	p.setup = function ()
	{
		this.width = 1024;
		this.height = 250;
		canvas = p.createCanvas(this.width, this.height);
		canvas.parent('transf');
		canvas.style('border', '2px solid');
		canvas.style('display', 'block');
		canvas.style('visibility', 'visible');
	}

	p.draw = function ()
	{
		p.background(255, 255, 255);
		display_function(S, 12, this.height * 0.95);
	}

	function display_function(f, Ox, Oy) {
		p.translate(Ox, Oy);
		p.scale(1, -1);
		for (let i = 0; i < f.length-1; i++) {
			p.line(i, f[i], i+1, f[i+1]);
		}
		p.resetMatrix();
	}
}

var canvas_2 = new p5(transfo);