export const rgbToHsl = (r: number, g: number, b: number) => {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	let h: number;
	let s: number;
	const l = (max + min) / 2;

	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case red:
				h = (green - blue) / d + (green < blue ? 6 : 0);
				break;
			case green:
				h = (blue - red) / d + 2;
				break;
			case blue:
				h = (red - green) / d + 4;
				break;
		}
		// @ts-ignore
		h = h / 6;
	}

	return [h, s, l];
};
