//npx jest backend/tests/cardGenerator.test.js  

const {
    loadDataFromDB,
    generateCardWithBackpack,
    assignAgeWeighted,
    assignGender,
    assignHealth,
    assignBackpackItems
} = require('../controllers/cardGenerator');

jest.mock('mysql2/promise');

describe('Card Generator Functions', () => {
    describe('assignAgeWeighted', () => {
        test('should return a number in the range [18, 85]', () => {
            for (let i = 0; i < 100; i++) {
                const age = assignAgeWeighted();
                expect(Number.isInteger(age)).toBe(true);
                expect(age).toBeGreaterThanOrEqual(18);
                expect(age).toBeLessThanOrEqual(85);
            }
        });
    });

    describe('assignGender', () => {
        test('should return "Чоловік" or "Жінка"', () => {
            for (let i = 0; i < 100; i++) {
                const gender = assignGender();
                expect(["Чоловік", "Жінка"]).toContain(gender);
            }
        });
    });
    
    describe('assignHealth', () => {
        const healthConditions = ['Діабет', 'Астма', 'Гіпертонія'];
        
        test('should return either "Здоровий" or a health condition', () => {
            for (let i = 0; i < 100; i++) {
                const health = assignHealth(healthConditions);
                expect(["Здоровий", ...healthConditions]).toContain(health);
            }
        });
    });
    
    describe('assignBackpackItems', () => {
        const items = ['Ніж', 'Вода', 'Аптечка', 'Ліхтарик'];
        
        test('should return array with specified number of items', () => {
            const result = assignBackpackItems(items, 2);
            expect(result).toHaveLength(2);
            expect(result.every(item => items.includes(item))).toBe(true);
        });

        test('should handle empty array', () => {
            const result = assignBackpackItems([], 2);
            expect(result).toEqual([]);
        });

        test('should not exceed available items', () => {
            const smallArray = ['Ніж', 'Вода'];
            const result = assignBackpackItems(smallArray, 3);
            expect(result.length).toBeLessThanOrEqual(2);
        });
    });
    
    describe('generateCardWithBackpack', () => {
        const professions = ['Лікар', 'Інженер'];
        const skills = ['Перша допомога', 'Ремонт'];
        const healthConditions = ['Діабет', 'Астма'];
        const flaws = ['Короткозорість', 'Кульгавість'];
        const backpackItems = ['Ніж', 'Вода'];

        test('should generate card with all required properties', () => {
            const card = generateCardWithBackpack(
                professions,
                skills,
                healthConditions,
                flaws,
                backpackItems
            );

            expect(card).toHaveProperty('age');
            expect(card).toHaveProperty('gender');
            expect(card).toHaveProperty('profession');
            expect(card).toHaveProperty('skill');
            expect(card).toHaveProperty('health');
            expect(card).toHaveProperty('flaw');
            expect(card).toHaveProperty('backpack');
            expect(card).toHaveProperty('childfreeStatus');
        });

        test('should generate valid property values', () => {
            const card = generateCardWithBackpack(
                professions,
                skills,
                healthConditions,
                flaws,
                backpackItems
            );

            expect(card.age).toBeGreaterThanOrEqual(18);
            expect(card.age).toBeLessThanOrEqual(85);
            expect(['Чоловік', 'Жінка']).toContain(card.gender);
            expect(professions).toContain(card.profession);
            expect(skills).toContain(card.skill);
            expect(['Здоровий', ...healthConditions]).toContain(card.health);
            expect(['Без вад', ...flaws]).toContain(card.flaw);
            expect(Array.isArray(card.backpack)).toBe(true);
            expect(['Childfree', 'З дітьми']).toContain(card.childfreeStatus);
        });
    });

    describe('loadDataFromDB', () => {
        test('should load data from database', async () => {
            const mockConnection = {
                execute: jest.fn().mockResolvedValue([[{ testColumn: 'value1' }, { testColumn: 'value2' }]])
            };
            const result = await loadDataFromDB(mockConnection, 'testTable', 'testColumn');
            expect(result).toEqual(['value1', 'value2']);
            expect(mockConnection.execute).toHaveBeenCalledWith('SELECT testColumn FROM testTable');
        });

        test('should handle database errors', async () => {
            const mockConnection = {
                execute: jest.fn().mockRejectedValue(new Error('DB Error'))
            };
            await expect(loadDataFromDB(mockConnection, 'testTable', 'testColumn'))
                .rejects
                .toThrow('DB Error');
        });
    });
});

beforeAll(() => {
});

afterAll(() => {
    jest.resetAllMocks();
});