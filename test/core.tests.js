import {List, Map, fromJS as Immutable} from 'immutable';
import {expect} from 'chai';
import {setEntries, next, vote} from '../src/core';

describe('application logic', () => {

    describe('setEntries', () => {

        it('adds the entries to the state', () => {
            const state = Map();
            const entries = List.of('Trainspotting', '28 Days Later');

            const nextState = setEntries(state, entries);

            expect(nextState).to.equal(Map({
                entries: entries
            }));
        });

        it('converts to immutable', () => {
            const state = Map();
            const entries = ['Trainspotting', '28 Days Later'];
            const nextState = setEntries(state, entries);

            expect(nextState).to.equal(Map({
                entries: List.of('Trainspotting', '28 Days Later')
            }));
        })
    });

    describe('next', () => {

        it('takes the next two entries under vote', () => {
            const state = Map({
                entries: List.of('Trainspotting', '28 Days Later', 'Sunshine')
            });

            const nextState = next(state);

            expect(nextState).to.equal(Map({
                vote: Map({
                    pair: List.of('Trainspotting', '28 Days Later')
                }),
                entries: List.of('Sunshine')
            }));
        });

        it('puts winner of current vote back to entries', () => {

            const stateJson = {
                vote: {
                    pair: ['Trainspotting', '28 Days Later'],
                    tally: {
                        'Trainspotting': 4,
                        '28 Days Later': 2
                    }
                },
                entries: ['Sunshine', 'Millions', '127 Hours']
            }

            const nextState = next(Immutable(stateJson));

            const resultJson = {
                vote: {
                    pair: ['Sunshine', 'Millions'],
                },
                entries: ['127 Hours', 'Trainspotting']
            }

            expect(nextState).to.equal(Immutable(resultJson));
        });

        it('puts both from tied vote back to entries', () => {

            const stateJson = {
                vote: {
                    pair: ['Trainspotting', '28 Days Later'],
                    tally: {
                        'Trainspotting': 3,
                        '28 Days Later': 3
                    }
                },
                entries: ['Sunshine', 'Millions', '127 Hours']
            };

            const nextState = next(Immutable(stateJson));

            const resultJson = {
                vote: {
                    pair: ['Sunshine', 'Millions'],
                },
                entries: ['127 Hours', 'Trainspotting', '28 Days Later']
            };

            expect(nextState).to.equal(Immutable(resultJson));
        });

        it('marks winner when just one entry left', () => {

            const stateJson = {
                vote: {
                    pair: ['Trainspotting', '28 Days Later'],
                    tally: {
                        'Trainspotting': 4,
                        '28 Days Later': 2
                    }
                },
                entries: []
            }

            const nextState = next(Immutable(stateJson));

            expect(nextState).to.equal(Immutable({
                winner: 'Trainspotting'
            }));
        });
    });

    describe('vote', () => {

        it('creates a tally for the voted entry', () => {

            const stateJson = {
                pair: ['Trainspotting', '28 Days Later']
            };

            const nextState = vote(Immutable(stateJson), 'Trainspotting');

            const nextStateJson = {
                pair: ['Trainspotting', '28 Days Later'],
                tally: { 'Trainspotting': 1 }
            }

            expect(nextState).to.equal(Immutable(nextStateJson));
        });

        it('adds to existing tally for the voted entry', () => {

            const stateJson = {
                pair: ['Trainspotting', '28 Days Later'],
                tally: {
                    'Trainspotting': 3,
                    '28 Days Later': 2
                }
            }

            const nextState = vote(Immutable(stateJson), 'Trainspotting');

            const resultJson = {
                pair: ['Trainspotting', '28 Days Later'],
                tally: {
                    'Trainspotting': 4,
                    '28 Days Later': 2
                }
            }

            expect(nextState).to.equal(Immutable(resultJson));
        });
    });
});