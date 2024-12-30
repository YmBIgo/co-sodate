import dayjs, {Dayjs} from "dayjs";

export function fixedBabyName(name: string, gender: 1 | 0): string {
    return gender === 1 ? name + "くん" : name + "ちゃん"
}

export function getBabyAge(birthDate: Dayjs | null) {
    const currentDate = dayjs();
    const year = currentDate.diff(birthDate, "year");
    const month = currentDate.diff(birthDate, "month") % 12;
    return { year, month };
}