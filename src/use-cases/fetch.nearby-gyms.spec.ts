import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { fetchNearbyGymsUseCase } from './fetch-nearby-gyms'

let gymsRepository: InMemoryGymsRepository
let sut: fetchNearbyGymsUseCase

describe('Fetch Nearby Gyms Use Case', () => {
    beforeEach(async () => {
        gymsRepository = new InMemoryGymsRepository()
        sut = new fetchNearbyGymsUseCase(gymsRepository)
    })

    it('should be able to fetch nearby gyms', async () => {
        // Empire state Building
        await gymsRepository.create({
            title: 'Near gym',
            description: null,
            phone: null,
            latitude: 40.748417,
            longitude: -73.985833,
        })

        // Harlem region - 10km north of the Empire State Building.
        await gymsRepository.create({
            title: 'Far gym',
            description: null,
            phone: null,
            latitude: 40.838417,
            longitude: -73.985833,
        })

        const { gyms } = await sut.execute({
            userLatitude: 40.748417,
            userLongitude: -73.985833,
        })

        expect(gyms).toHaveLength(1)
        expect(gyms).toEqual([expect.objectContaining({ title: 'Near gym' })])
    })
})
