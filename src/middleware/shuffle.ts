export const shuffle = <T>(array: T[]) => {
	let currentIndex = array.length;

	while (currentIndex !== 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// @ts-ignore
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
};
