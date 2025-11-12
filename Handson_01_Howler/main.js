console.log("main.js!!");

window.onload = ()=>{
	console.log("onload!!");

	// JavaScriptここから
	//Howler.jsでサウンドオブジェクトを作る処理
	//ボタン０１
	const snd01 = new Howl({
		src: "./sounds/se01.mp3"
	});
	//ボタン０２
	const snd02 = new Howl({
		src: "./sounds/se02.mp3"
	});

	//ボタン０３
	const snd03 = new Howl({
		src: "./sounds/se03.mp3",
		//loop: false,
		//volume: 1.0
	});

	//ボタン０４
	const snd04 = new Howl({
		src: "./sounds/doramu.mp3"
	});

	//ボタン０５
	const snd05 = new Howl({
		src: "./sounds/maoudog02.mp3"
	});

	//ボタン０６
	const snd06 = new Howl({
		src: "./sounds/maouhuman02.mp3"
	});

	//ボタン０７
	const snd07 = new Howl({
		src: "./sounds/maouhuman03.mp3"
	});

	//ボタン０８
	const snd08 = new Howl({
		src: "./sounds/maouhuman05.mp3"
	});

	//ボタン０９
	const snd09 = new Howl({
		src: "./sounds/sorya.mp3"
	});

	//ボタンを取得して、クリックイベントを付ける処理
	//ボタン０１
	const btn01 = document.querySelector("#btn01");
	console.log(btn01);//とれているかを確認
	btn01.addEventListener("click", ()=>{
		console.log("btn");
		snd01.play();// 音を鳴らす
	});

	//ボタン０２
	const btn02 = document.querySelector("#btn02");
	console.log(btn02);
	btn02.addEventListener("click", ()=>{
		snd02.play();
	});

	//ボタン０３
	const btn03 = document.querySelector("#btn04");
	console.log(btn03);
	btn03.addEventListener("click", ()=>{
		snd03.play();
	});

	//ボタン０４
	const btn04 = document.querySelector("#btn05");
	console.log(btn04);
	btn04.addEventListener("click", ()=>{
		snd04.play();
	});

	//ボタン０５
	const btn05 = document.querySelector("#btn06");
	console.log(btn05);
	btn05.addEventListener("click", ()=>{
		snd05.play();
	});

	//ボタン０６
	const btn06 = document.querySelector("#btn07");
	console.log(btn06);
	btn06.addEventListener("click", ()=>{
		snd06.play();
	});

	//ボタン０７
	const btn07 = document.querySelector("#btn08");
	console.log(btn07);
	btn07.addEventListener("click", ()=>{
		snd07.play();
	});

	//ボタン０８
	const btn08 = document.querySelector("#btn09");
	console.log(btn08);
	btn08.addEventListener("click", ()=>{
		snd08.play();
	});

	//ボタン０９
	const btn09 = document.querySelector("#btn03");
	console.log(btn09);
	btn09.addEventListener("click", ()=>{
		snd09.play();
	});
}