export function numberWithSpaces(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function getWordFormByNumber(value: number, wordsForm: string[]){  
	value = Math.abs(value) % 100; 
	const num = value % 10;
	if(value > 10 && value < 20) return wordsForm[2]; 
	if(num > 1 && num < 5) return wordsForm[1];
	if(num === 1) return wordsForm[0]; 
	return wordsForm[2];
}