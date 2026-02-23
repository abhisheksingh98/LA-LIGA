import { playersSeed, teamsSeed, matchesSeed, promotionsSeed, positionsSeed } from './seedData';

class DBService {
    constructor() {
        this.initialize();
    }

    initialize() {
        if (!localStorage.getItem('mcity_players')) {
            localStorage.setItem('mcity_players', JSON.stringify(playersSeed));
        }
        if (!localStorage.getItem('mcity_teams')) {
            localStorage.setItem('mcity_teams', JSON.stringify(teamsSeed));
        }
        if (!localStorage.getItem('mcity_matches')) {
            localStorage.setItem('mcity_matches', JSON.stringify(matchesSeed));
        }
        if (!localStorage.getItem('mcity_promotions')) {
            localStorage.setItem('mcity_promotions', JSON.stringify(promotionsSeed));
        }
        if (!localStorage.getItem('mcity_positions')) {
            localStorage.setItem('mcity_positions', JSON.stringify(positionsSeed));
        }
        if (!localStorage.getItem('mcity_auth')) {
            localStorage.setItem('mcity_auth', JSON.stringify({ email: 'admin@mcity.com', password: 'password' }));
        }
    }

    get(collection) {
        return JSON.parse(localStorage.getItem(`mcity_${collection}`));
    }

    set(collection, data) {
        localStorage.setItem(`mcity_${collection}`, JSON.stringify(data));
    }

    push(collection, item) {
        const data = this.get(collection);
        const newItem = {
            ...item,
            id: Math.random().toString(36).substr(2, 9)
        };
        data.push(newItem);
        this.set(collection, data);
        return newItem;
    }

    update(collection, id, newData) {
        const data = this.get(collection);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...newData };
            this.set(collection, data);
        }
    }

    login(email, password) {
        const auth = JSON.parse(localStorage.getItem('mcity_auth'));
        if (auth.email === email && auth.password === password) {
            return { email };
        }
        throw new Error('Invalid credentials');
    }
}

export const dbService = new DBService();
