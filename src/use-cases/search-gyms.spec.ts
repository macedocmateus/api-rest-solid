import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { SearchGymsUseCase } from './search-gyms'

let gymsRepository: InMemoryGymsRepository
let sut: SearchGymsUseCase

describe('Search Gyms Use Case', () => {
    beforeEach(async () => {
        gymsRepository = new InMemoryGymsRepository()
        sut = new SearchGymsUseCase(gymsRepository)
    })

    it('should be able to search for gyms', async () => {
        await gymsRepository.create({
            title: 'heathcare gym',
            description: null,
            phone: null,
            latitude: 40.748417,
            longitude: -73.985833,
        })

        await gymsRepository.create({
            title: 'moviment gym',
            description: null,
            phone: null,
            latitude: 40.748417,
            longitude: -73.985833,
        })

        const { gyms } = await sut.execute({
            query: 'heathcare',
            page: 1,
        })

        expect(gyms).toHaveLength(1)
        expect(gyms).toEqual([
            expect.objectContaining({ title: 'heathcare gym' }),
        ])
    })

    it('should be able to fetch paginated gyms search', async () => {
        for (let i = 1; i <= 22; i++) {
            await gymsRepository.create({
                title: `moviment gym ${i}`,
                description: null,
                phone: null,
                latitude: 40.748417,
                longitude: -73.985833,
            })
        }

        const { gyms } = await sut.execute({
            query: 'moviment',
            page: 2,
        })

        expect(gyms).toHaveLength(2)
        expect(gyms).toEqual([
            expect.objectContaining({ title: 'moviment gym 21' }),
            expect.objectContaining({ title: 'moviment gym 22' }),
        ])
    })
})
