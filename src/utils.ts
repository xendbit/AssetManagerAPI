import { OrderRequest } from "./models/request.objects/order.requet";
const web3Utils = require('web3-utils');

export class Utils {
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
        return Utils.shuffleArray(randPasswordArray.map(function (x) { return x[Math.floor(Math.random() * x.length)] })).join('');
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

    public static getKey(or: OrderRequest) {
        const key = web3Utils.soliditySha3(
            { type: 'uint256', value: or.amount },
            { type: 'uint256', value: or.price },
            { type: 'uint256', value: or.tokenId },
            { type: 'uint256', value: new Date().getTime() }
        );

        return key;
    }

    public static getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
