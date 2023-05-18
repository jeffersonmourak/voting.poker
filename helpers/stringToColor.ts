function stringToColor(string: string, randomize?: boolean): string {
    let saltedString = string;
    let hash = 0;
    let i;

    if (randomize) {
        saltedString = string + Math.random();
    }

    for (i = 0; i < saltedString.length; i += 1) {
        hash = saltedString.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.substr(-2);
    }

    return color;
}

export default stringToColor;
