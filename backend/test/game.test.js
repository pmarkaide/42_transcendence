// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   game.test.js                                       :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: pleander <pleander@student.hive.fi>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/04/18 20:49:42 by pleander          #+#    #+#             //
//   Updated: 2025/04/18 21:05:58 by pleander         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

const t = require('tap');
const fastify = require('../server');
const db = require('../db');

// TEST 1: Create a new game
let gameId;
let userAId;
let userBId;

// Clear users table before running the tests
t.before(async () => {
	await new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run('DELETE FROM matches', err => {
				if (err) return reject(err);
			});
			db.run('DELETE FROM users', err => {
				if (err) return reject(err);
			});
			db.run("DELETE FROM sqlite_sequence WHERE name = 'matches'", err => {
				if (err) return reject(err);
			});
			db.run("DELETE FROM sqlite_sequence WHERE name = 'users'", err => {
				if (err) return reject(err);
				resolve();
			});
		});
	});
	const userA = { username: 'userA', password: 'passA' };
	const userB = { username: 'userB', password: 'passB' };

	const regA = await fastify.inject({
		method: 'POST',
		url: '/user/register',
		payload: userA,
	});
	userAId = JSON.parse(regA.payload).id;

	const regB = await fastify.inject({
		method: 'POST',
		url: '/user/register',
		payload: userB,
	});
	userBId = JSON.parse(regB.payload).id;
});

t.test('Test 1: POST /game/new - creates a new game', async t => {
	const payload = {player1_id: userAId, player2_id: userBId};
	const res = await fastify.inject({
		method: 'POST',
		url: '/game/new',
		payload,
	});

	t.equal(res.statusCode, 200, 'Should return 200 on successful game creation');
	const body = JSON.parse(res.payload);
	t.ok(typeof body.id == 'number', 'Response includes a game id');
	gameId = body.id;
});

t.test('Test 2: POST /game/new - creates a new game fails - same player id)', async t => {
	const payload = {player1_id: userAId, player2_id: userAId};

	const res = await fastify.inject({
		method: 'POST',
		url: '/game/new',
		payload,
	});

	t.equal(res.statusCode, 400, 'Should return 400 when player ids are equal');
});

t.test('Test 3: POST /game/new - creates a new game fails - non existing player id)', async t => {
	const payload = {player1_id: 42, player2_id: userBId};

	const res = await fastify.inject({
		method: 'POST',
		url: '/game/new',
		payload,
	});

	t.equal(res.statusCode, 400, 'Should return 400 when player id does not exist');
});

t.test('Test 4: POST /game/new - creates a new game fails - non existing player id)', async t => {
	const payload = {player1_id: userAId, player2_id: 42};

	const res = await fastify.inject({
		method: 'POST',
		url: '/game/new',
		payload,
	});

	t.equal(res.statusCode, 400, 'Should return 400 when player id does not exist');
});


t.test('Test 5: POST /game/new - creates a new game fails - non existing player id)', async t => {
	const payload = {player1_id: 84, player2_id: 42};

	const res = await fastify.inject({
		method: 'POST',
		url: '/game/new',
		payload,
	});

	t.equal(res.statusCode, 400, 'Should return 400 when player id does not exist');
});

t.test('Test 6: GET /game/list - lists games)', async t => {
	const res = await fastify.inject({
		method: 'GET',
		url: '/game/list'
	});

	t.equal(res.statusCode, 200, 'Should return 200 when listing succeeds');
	const body = JSON.parse(res.payload);
	t.ok(body.length > 0, 'There should be at least one game in the game list');
});

t.test('Test 7: GET /game/list:id - List specific game information', async t => {
	t.ok(gameId, 'Game ID must be set from earlier test');
	const res = await fastify.inject({
		method: 'GET',
		url: `/game/list/${gameId}`
	});
	t.equal(res.statusCode, 200, 'Should return 200 for existing game');
	const body = JSON.parse(res.payload);
	t.equal(body.id, gameId, 'Should return the correct game');
});

t.test('Test 8: GET /game/list:id - Fail to list non existing game', async t => {
	t.ok(gameId, 'Game ID must be set from earlier test');
	const res = await fastify.inject({
		method: 'GET',
		url: `/game/list/42`
	});
	t.equal(res.statusCode, 404, 'Should return 404 for non existing game');
	t.end();
});

t.teardown(async () => {
	try {
		await new Promise((resolve, reject) => {
			db.serialize(() => {
				db.run('DELETE FROM matches', err => {
					if (err) return reject(err);
				});
				db.run('DELETE FROM users', err => {
					if (err) return reject(err);
				});
				db.run("DELETE FROM sqlite_sequence WHERE name = 'matches'", err => {
					if (err) return reject(err);
				});
				db.run("DELETE FROM sqlite_sequence WHERE name = 'users'", err => {
					if (err) return reject(err);
					resolve();
				});
			});
		});

		await new Promise((resolve, reject) => {
			db.close(err => (err ? reject(err) : resolve()));
		});

		await fastify.close();
	} catch (err) {
		console.error('Teardown error:', err);
		throw err;
	}
});
