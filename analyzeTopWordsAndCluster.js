const fs = require('fs'),
	readline = require('readline'),
	clusterfck = require('clusterfck');

let fullText = fs.readFileSync('./Red_Mansions_Anasoft_A_CHT_UTF-8_txt.txt', 'utf8');
　
let tnbs = fullText.split(/^(第.{1,3}回.+)$/m);
let w2cMaps = {};

let occurCount = 400;
if (process.argv[2]) occurCount = parseInt(process.argv[2]);
if (occurCount < 100) {
	console.error(`less than ${occurCount} samples will cause significant deviation when do cluster analysis`);
	process.exit(1);
}

for (let i = 1; i < tnbs.length; i += 2) {
	let plainBody = tnbs[i + 1].replace(/[\n\r\t　 ，。：「」、？；！《》『』—（）〔〕·－]/g, '');
	for (let i = 0; i < plainBody.length; i++) {
		let word = plainBody.charAt(i);
		if (w2cMaps[word]) {
			w2cMaps[word]++;
		} else {
			w2cMaps[word] = 1;
		}
	}
	tnbs[i + 1] = plainBody;
}

let w2cArray = [];

Object.keys(w2cMaps).forEach(k => {
	/*
	if (w2cMaps[k] >= occurCount) {
		wordArray.push(k);
	}
	*/
	w2cArray.push({[k]: w2cMaps[k]});
});

console.log(`${Object.keys(w2cMaps).length} distinct words have been found...`);
// console.log(`${totalCount} vs ${totalCountPerWord}`);

w2cArray.sort((a, b) => {
	return b[Object.keys(b)[0]] - a[Object.keys(a)[0]];
});

let wordArray = [];
for (let w2c of w2cArray) {
	if (w2c[Object.keys(w2c)[0]] >= occurCount) {
		wordArray.push(Object.keys(w2c)[0]);
	} else break;
}

console.log(`${wordArray.length} words that occurs for ${occurCount}+ times will be used for cluster analysis`);
console.log(`${wordArray.join('')}`);

let vectors = [];
for (let i = 1; i < tnbs.length; i += 2) {
	let vector = [];
	vector.title = [tnbs[i]];
	for (let word of wordArray) {
		let regex = new RegExp(word, 'g');
		let match = tnbs[i + 1].match(regex);
		vector.push((match? match.length : 0) / tnbs[i + 1].length * 1000);
	}
	vectors.push(vector);
}

let clusters = clusterfck.kmeans(vectors, 2);
for (let i in clusters) {
	console.log(`--------------- cluster #${i}: ${clusters[i].length} ---------------`);
	for (let chap of clusters[i]) {
		console.log(chap.title[0]);
	}
}