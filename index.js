'use strict'
/**
* Параметры командной строки на запуск
* --threads количество воркеров для расчета
* --limit верхний предел вычисляемых простых чисел
*/
const PROCESS_UNIT = './get_prime.js'
const DEFAULT_LIMIT = 1.8E+5

const { Worker } = require('node:worker_threads')
const { performance } = require('perf_hooks')
const { cpus } = require('os')
/**
* @description получить аргументы командной строки
*/
const getCLOptions = function() {
	const { argv } = process
	const result = {}
	argv.slice(2).forEach(arg => {
		const [key, val] = arg.split('=')
		const actualKey = key.replace(/^--/, '')
		result[actualKey] = val ?? true
	})
	
	return result
}

const options = getCLOptions()

const N_THREAD = options.threads ? Number(options.threads) : cpus().length
const LIMIT = options.limit ? Number(options.limit) : DEFAULT_LIMIT

/**
* @async
* @description вычислить значения простых числе до заданного числа
* @params searchCeil Number предел вычисления простых чисел
* @returns Record<string, Uint32Array> простые числа, сгруппированные по исполнявшим их воркерам
*/
const computePrimes = async function(searchCeil) {
	let completion = 0
	let dT = 0
	let result = {}
	const workers = []

	return new Promise((resolve) => {
		for(let i = 0; i < N_THREAD; i++) {		
			const workerUnit = new Worker(PROCESS_UNIT)
			workerUnit.on('message', msg => {
				result[i.toString()] = msg
				workerUnit.unref()
				if(++completion === N_THREAD) resolve(result)
			})
			
			workers.push(workerUnit)
		}
		
		const delta = Math.ceil(searchCeil / N_THREAD)
		let xMin = 0
		let xMax = delta
		dT = performance.now()

		for(let i = 0; i < N_THREAD; i++) {
			workers[i].postMessage({ xMin, xMax })
			xMin += delta
			xMax += delta
		}
	}).then()
};
/**
* @description запускаем воркер внутри асинхронной IIFE
*/
(async function() {
	let t0 = performance.now()
	const primes = await computePrimes(LIMIT)
	const dT = performance.now() - t0
	console.log(dT)
	for(let i = 0; i < N_THREAD; i++) {
		const primePart = primes[i.toString()]
		const nPrime = primePart.length - 1
		console.log(primePart[nPrime])
		console.log('------------')
	} 
})();