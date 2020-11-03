export class Config {
    public static readonly web3URL = 'http://209.250.234.75:8545';
    public static readonly dtslAddress = '0x94Ce615ca10EFb74cED680298CD7bdB0479940bc';
    public static readonly contractor = '0x9e8e11B145403dc6Cb3e002d90f0d715817aE323';
    public static readonly contractAddress = '0x37aE6EBFE55c6436F501853a4EA7Ecf5bFc6c1C8';
    public static readonly abiPath = './AssetManager.json';
    public static readonly gas = '4004356';     

    public static generatePassword(passwordLength) {
        const numberChars = "0123456789";
        const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowerChars = "abcdefghijklmnopqrstuvwxyz";
        const allChars = numberChars + upperChars + lowerChars;
        let randPasswordArray = Array(passwordLength);
        randPasswordArray[0] = numberChars;
        randPasswordArray[1] = upperChars;
        randPasswordArray[2] = lowerChars;
        randPasswordArray = randPasswordArray.fill(allChars, 3);
        return Config.shuffleArray(randPasswordArray.map(function (x) { return x[Math.floor(Math.random() * x.length)] })).join('');
    }

    public static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }    
}
