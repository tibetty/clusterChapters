const fs = require('fs'),
	readline = require('readline'),
	clusterfck = require('clusterfck');

// const virtualWords = ['而', '何', '乎', '乃', '其', '且', '若', '所', '為', '焉', '也', '以', '因', '於', '與', '則', '者', '之'];
// const featureWords = ['又', '不', '沒', '無', '別', '著', '有', '了', '這', '那', '得', '的', '卻', '來', '去', '只', '和', '呢', '自', '此', '可', '倒', '更', '亦', '便', '方', '罷', '都', '正', '仍', '已'];

let words = [];

let rl = readline.createInterface({
	input: fs.createReadStream('./keywords.txt', 'utf8')
});

rl.on('line', line => {
	words.push(line);
});
rl.on('close', () => {
	// console.log(words.length);
	let fullText = fs.readFileSync('./Red_Mansions_Anasoft_A_CHT_UTF-8_txt.txt', 'utf8');

	let tnbs = fullText.split(/^(第.{1,3}回.+)$/m);
	let vectors = [];

	for (let i = 1; i < tnbs.length; i += 2) {
		let vector = [];
		vector.title = [tnbs[i]];
		let plainBody = tnbs[i + 1].replace(/[\n\r\t　 ，。：「」、？；！《》『』—（）〔〕·－]/g, '');
		for (let word of words) {
			let regex = new RegExp(word, 'g');
			let match = plainBody.match(regex);
			vector.push((match? match.length : 0) / plainBody.length * 1000);
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
});