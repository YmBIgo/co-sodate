export const generateUUID = () =>
    '00000000-0000-4000-8000-000000000000'.replace(/[08]/g, (c: string) =>
      (Number(c) ^ (Math.floor(Math.random()*16) & (15 >> (Number(c) / 4)))).toString(16)
);

// Base62の文字セット
const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// UUIDを生成してBase62の24桁に変換する関数
export function generateBase62UUID() {
    let hashResult = ""
    for (let i = 0; i < 24; i++) {
        const randomNum = Math.floor(Math.random()*62)
        const randomWord = BASE62_ALPHABET[randomNum]
        hashResult += randomWord
    }
    return hashResult
}
