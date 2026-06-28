export const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertHundreds = (n: number): string => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) {
            const remainder = n % 10;
            return tens[Math.floor(n / 10)] + (remainder > 0 ? ' ' + ones[remainder] : '');
        }
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        return ones[hundred] + ' Hundred' + (remainder > 0 ? ' ' + convertHundreds(remainder) : '');
    };

    const convertChunk = (n: number): string => {
        if (n === 0) return '';
        return convertHundreds(n);
    };

    // Handle numbers up to trillions
    const billion = Math.floor(num / 1000000000);
    const billionRemainder = num % 1000000000;

    const million = Math.floor(billionRemainder / 1000000);
    const millionRemainder = billionRemainder % 1000000;

    const thousand = Math.floor(millionRemainder / 1000);
    const remainder = millionRemainder % 1000;

    let result = '';

    if (billion > 0) {
        result += convertChunk(billion) + ' Billion';
        if (billionRemainder > 0) result += ' ';
    }

    if (million > 0) {
        result += convertChunk(million) + ' Million';
        if (millionRemainder > 0) result += ' ';
    }

    if (thousand > 0) {
        result += convertChunk(thousand) + ' Thousand';
        if (remainder > 0) result += ' ';
    }

    if (remainder > 0) {
        result += convertChunk(remainder);
    }

    return result.trim();
};