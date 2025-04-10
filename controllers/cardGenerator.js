const fs = require('fs');
const mysql = require('mysql2/promise');

// Функція для завантаження даних з бази даних
const loadDataFromDB = async (connection, tableName, columnName) => {
    const [rows] = await connection.execute(`SELECT ${columnName} FROM ${tableName}`);
    return rows.map(row => row[columnName]);
};

// Визначення віку з вагами
const assignAgeWeighted = () => {
    const ageGroups = [
        { min: 18, max: 30, weight: 0.5 },
        { min: 31, max: 50, weight: 0.3 },
        { min: 51, max: 70, weight: 0.15 },
        { min: 71, max: 85, weight: 0.05 }
    ];
    const weights = ageGroups.map(group => group.weight);
    const randomIndex = weightedRandomIndex(weights);
    const chosenGroup = ageGroups[randomIndex];
    return getRandomInt(chosenGroup.min, chosenGroup.max);
};

// Вибір статі
const assignGender = () => {
    return Math.random() < 0.5 ? "Чоловік" : "Жінка";
};

// Визначення здоров'я
const assignHealth = (healthConditions) => {
    return Math.random() < 0.25 ? "Здоровий" : getRandomElement(healthConditions);
};

// Вибір кількох предметів з рюкзака
const assignBackpackItems = (items, numItems = 2) => {
    if (!items.length) {
        console.error('Масив предметів порожній.');
        return [];
    }
    // Обмежуємо кількість предметів до доступної кількості
    const maxItems = Math.min(numItems, items.length);
    return getRandomElements(items, maxItems);
};

// Генерація картки з усіма характеристиками
const generateCardWithBackpack = (professions, skills, healthConditions, flaws, backpackItems) => {
    const age = assignAgeWeighted();
    const gender = assignGender();
    const profession = getRandomElement(professions);
    const skill = getRandomElement(skills);
    const health = assignHealth(healthConditions);
    const flaw = Math.random() < 0.3 ? getRandomElement(flaws) : 'Без вад';
    const backpack = assignBackpackItems(backpackItems, getRandomInt(2, 3));
    const childfreeStatus = Math.random() < 0.15 ? "Childfree" : "З дітьми";
    return {
        age,
        gender,
        profession,
        skill,
        health,
        flaw,
        backpack,
        childfreeStatus
    };
};

// Допоміжні функції
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const getRandomElements = (array, count) => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const weightedRandomIndex = (weights) => {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    for (let i = 0; i < weights.length; i++) {
        cumulativeWeight += weights[i];
        if (randomValue < cumulativeWeight) {
            return i;
        }
    }
    return weights.length - 1; // fallback in case of rounding errors
};

// Експорт функцій
module.exports = {
    loadDataFromDB,
    generateCardWithBackpack
};
