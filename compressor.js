// SMS Text Compression - NO $ MARKER VERSION

class LossyCompressor {
    constructor() {
        this.abbreviations = {
            "tomorrow": "tmrw", "tonight": "2n8", "today": "tdy", "later": "l8r",
            "great": "gr8", "before": "b4", "for": "4", "to": "2", "too": "2",
            "you": "u", "your": "ur", "are": "r", "see": "c", "please": "pls",
            "because": "bcoz", "people": "ppl", "want": "wnt", "dinner": "dnr",
            "about": "abt", "through": "thru", "with": "wth", "like": "lk",
            "going": "goin", "love": "luv", "from": "frm", "work": "wrk", "hello": "hi",
        };
        this.vowels = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);
    }

    applyAbbreviations(text) {
        // sort by descending word length so longer matches come first
        const sorted = Object.entries(this.abbreviations)
            .sort((a, b) => b[0].length - a[0].length);
        let result = text.toLowerCase();
        for (const [word, abbr] of sorted) {
            const regex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
            result = result.replace(regex, abbr);
        }
        return result;
    }

    removeVowels(text) {
        const words = text.split(' ');
        const result = [];
        for (const word of words) {
            if (word.length <= 2 || /^\d+$/.test(word)) {
                result.push(word);
                continue;
            }
            let newWord = word[0];
            for (let i = 1; i < word.length; i++) {
                if (!this.vowels.has(word[i])) {
                    newWord += word[i];
                }
            }
            result.push(newWord);
        }
        return result.join(' ');
    }

    compress(text) {
        text = this.applyAbbreviations(text);
        text = text.split(/\s+/).join(' ').trim();
        text = this.removeVowels(text);
        return text;
    }
}

// ✓ BWT WITHOUT $ MARKER
class BurrowsWheelerTransform {
    encode(text) {
        if (!text) return { bwtString: "", originalIndex: 0 };

        const n = text.length;
        // create rotations (with index for stable sort)
        const rotations = [];
        for (let i = 0; i < n; i++) {
            rotations.push({ rot: text.substring(i) + text.substring(0, i), idx: i });
        }

        // stable, locale-aware sort by the rotation string (tie-break by original index)
        rotations.sort((a, b) => {
            const cmp = a.rot.localeCompare(b.rot);
            return cmp !== 0 ? cmp : (a.idx - b.idx);
        });

        const sortedRotations = rotations.map(x => x.rot);
        const originalIndex = sortedRotations.indexOf(text);

        const bwtString = sortedRotations.map(r => r[r.length - 1]).join('');

        return { bwtString, originalIndex };
    }

    decode(bwtString, originalIndex) {
        if (!bwtString) return "";

        const n = bwtString.length;
        let table = new Array(n).fill('');

        // standard iterative BWT inverse construction
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                table[j] = bwtString[j] + table[j];
            }
            table.sort();
        }

        return table[originalIndex];
    }
}

class ModifiedRLE {
    encode(text) {
        if (!text) return "";
        const result = [];
        let i = 0;

        while (i < text.length) {
            const char = text[i];
            let count = 1;
            while (i + count < text.length && text[i + count] === char) {
                count++;
            }

            if (count === 1) {
                result.push(char);
            } else {
                let remaining = count;
                // use chunks of up to 26 -> map 1..26 => 'A'..'Z'
                while (remaining > 0) {
                    if (remaining > 26) {
                        result.push(char + 'Z'); // Z stands for 26
                        remaining -= 26;
                    } else {
                        // 1 -> 'A' (65), 2 -> 'B', ..., 26 -> 'Z'
                        result.push(char + String.fromCharCode(64 + remaining));
                        remaining = 0;
                    }
                }
            }

            i += count;
        }

        return result.join('');
    }

    decode(encodedText) {
        if (!encodedText) return "";
        const result = [];
        let i = 0;

        while (i < encodedText.length) {
            const char = encodedText[i];

            if (i + 1 < encodedText.length && /[A-Z]/.test(encodedText[i + 1])) {
                const count = encodedText[i + 1].charCodeAt(0) - 64; // 'A'->1 ... 'Z'->26
                result.push(char.repeat(count));
                i += 2;
            } else {
                result.push(char);
                i += 1;
            }
        }

        return result.join('');
    }
}

class SMSTextCompressor {
    constructor() {
        this.lossy = new LossyCompressor();
        this.bwt = new BurrowsWheelerTransform();
        this.rle = new ModifiedRLE();
    }

    compress(text) {
        if (!text) return null;

        const lossyText = this.lossy.compress(text);
        const { bwtString, originalIndex } = this.bwt.encode(lossyText);
        const rleText = this.rle.encode(bwtString);

        return {
            original_text: text,
            lossy_text: lossyText,
            bwt_text: bwtString,
            bwt_index: originalIndex,
            rle_text: rleText,
            original_length: text.length,
            lossy_length: lossyText.length,
            bwt_length: bwtString.length,
            final_length: rleText.length,
            compression_ratio: (text.length / rleText.length).toFixed(2),
            space_savings: ((text.length - rleText.length) / text.length * 100).toFixed(1)
        };
    }

    decompress(data) {
        const bwtDecoded = this.rle.decode(data.rle_text);
        const lossyDecoded = this.bwt.decode(bwtDecoded, data.bwt_index);
        const match = lossyDecoded === data.lossy_text;

        return { lossy_text: lossyDecoded, match };
    }
}
