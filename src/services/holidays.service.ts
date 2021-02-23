import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Holiday } from 'src/models/holidays.model';
import { Repository } from 'typeorm';

@Injectable()
export class HolidaysService {

    @InjectRepository(Holiday)
    holidayRepository: Repository<Holiday>;

    constructor() {
    }

    async init() {
        const fullHolidays: { name: string, day: number, month: string }[] = [
            { "name": "New Year's Day", day: 1, month: "Jan" },
            { "name": "Workers' Day", day: 1, month: "May" },
            { "name": 'Democracy Day', day: 12, month: "Jum" },
            { "name": 'Independence Day', day: 1, month: "Oct" },
            { "name": 'Christmas Day', day: 25, month: "Dec" },
            { "name": 'Boxing Day', day: 26, month: "Dec" },
            { "name": 'Good Friday', day: 2, month: "Apr" },
            { "name": 'Easter Monday', day: 5, month: "Apr" },
            { "name": 'Id el Fitr', day: 13, month: "May" },
            { "name": 'Id el Fitr holiday', day: 14, month: "May" },
            { "name": 'Id el Kabir', day: 20, month: "Jul" },
            { "name": 'Id el Kabir additional holiday', day: 21, month: "Jul" },
            { "name": 'Id el Maulud', day: 19, month: "Oct" },
        ];

        let holidays: Holiday[] = await this.holidayRepository.createQueryBuilder("holiday").getMany();

        if (holidays === undefined || holidays.length <= 0) {
            for (let hol of fullHolidays) {
                const holiday: Holiday = { ...hol };
                await this.holidayRepository.save(holiday);
            }
        }
    }

    async getHolidays(): Promise<Holiday[]> {
        await this.init();
        let holidays: Holiday[] = await this.holidayRepository.createQueryBuilder("holiday").getMany();
        return holidays;
    }

    async getHoliday(id: number): Promise<Holiday> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbHoliday = await this.holidayRepository.findOne(id);
                if (dbHoliday === undefined) {
                    reject("Holiday with ID not found");
                }

                resolve(dbHoliday);
            } catch (error) {
                reject(error);
            }
        })
    }

    async saveHoliday(holiday: Holiday): Promise<Holiday> {
        console.log(holiday);
        console.log(holiday.id);
        return new Promise(async (resolve, reject) => {
            try {
                let dbHoliday: Holiday;
                if (holiday.id === undefined) {
                    dbHoliday = await this.holidayRepository.save(holiday);
                    resolve(dbHoliday);
                } else {
                    dbHoliday = await this.holidayRepository.findOne(holiday.id);
                    if (dbHoliday === undefined) {
                        reject("Holiday with ID not found");
                    }

                    dbHoliday.day = holiday.day;
                    dbHoliday.month = holiday.month;
                    dbHoliday.name = holiday.name;

                    dbHoliday = await this.holidayRepository.save(dbHoliday);

                    resolve(dbHoliday);
                }
            } catch (error) {
                reject(error);
            }
        })
    }
}
