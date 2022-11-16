'use strict'

const { parentPort } = require('node:worker_threads')
const { performance } = require('perf_hooks')
/**
* @description найти простые числа в диапазоне xMin - xMax
* @returns Uint32Array
*/
const getPrime = function({ xMin, xMax }) {
	const delta = xMax - xMin
	let nPrime = 0
	let res = []
	let skip = false
	let x = xMin
	for(let i = 0; i < delta; i++) {
		skip = false
		for(let j = 0; j < nPrime; j++) {
			if(res[j] === 1) continue
			if(x % res[j] === 0) {
				skip = true
				break
			}
		}
		const xCeil = Math.floor(Math.sqrt(x))
		for(let j = 2; j < xCeil; j++) {
			if(x % j === 0) {
				skip = true
				break
			}
		}
		if(!skip) {
			res.push(x)
			nPrime++
		}
		x++
	}
	
	return Uint32Array.from(res)
}
// оставлено для сравнения и определения оверхэда на использование воркеров
/*const t0 = performance.now()
const primes = getPrime({xMin: 0, xMax: 1.2E+6})
console.log(performance.now() - t0)*/
/**
* @description сформировать ответ на получение ИД для расчета
*/
parentPort.on('message', msg => {
	const result = getPrime(msg)
	parentPort.postMessage(result)
})