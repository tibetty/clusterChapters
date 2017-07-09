const fs = require('fs'),
	clusterfck = require('clusterfck');

const virtualWords = ['而', '何', '乎', '乃', '其', '且', '若', '所', '為', '焉', '也', '以', '因', '於', '與', '則', '者', '之'];
let content = fs.readFileSync('./Red_Mansions_Anasoft_A_CHT_UTF-8_txt.txt', 'utf8');

let tnc = content.split(/^(第.{1,3}回.+)$/m);
let vectors = [];

for (let i = 1; i < tnc.length; i += 2) {
	let vector = [];
	vector.title = [tnc[i]];
	let plainContent = tnc[i + 1].replace(/[\n\r]/g, '');
	for (let word of virtualWords) {
		let regex = new RegExp(word, 'g');
		let match = plainContent.match(regex);
		vector.push((match? match.length : 0) / plainContent.length * 1000);
	}
	vectors.push(vector);
}

let clusters = clusterfck.kmeans(vectors, 2);
for (let i in clusters) {
	console.log(`--------------- cluster ${i} ---------------`);
	for (let chap of clusters[i]) {
		console.log(chap.title[0]);
	}
}