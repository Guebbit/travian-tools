//TODO guebbit



export const timeToSeconds = (date :string = '', delimiter :string = ':') => {
	const [hours = '0', minutes = '0', seconds = '0'] = date.split(delimiter);
	return parseInt(hours)*3600 + parseInt(minutes)*60 + parseInt(seconds)
}
export const secondsToTime = (seconds :number = 0, delimiter :string = ':') => {
	let s :number,
		m :number,
		h :number;
	seconds = Math.round(seconds);
	s = seconds % 60;
	seconds = Math.floor(seconds/60);
	m = seconds % 60;
	h = Math.floor(seconds/60);
	return 	h.toString().padStart(2, '0') + delimiter +
			m.toString().padStart(2, '0') + delimiter +
			s.toString().padStart(2, '0');
}
export const getToday = () => {
	return new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate();
}




export const getDelta = (size :number, a :number, b :number) :number => {
	// return (a - b + (3 * size + 1)) % (2 * size + 1) - size;
	return Math.min(size - (a - b), (a - b));
}
export const getDistance = (size :number, Xa :number, Xb :number, Ya :number, Yb :number) => {
	return Math.hypot(getDelta(size, Xa, Xb), getDelta(size, Ya, Yb));
}
export const getDistanceFromDelta = (deltaX :number, deltaY :number) => {
	return Math.hypot(deltaX,deltaY);
}
