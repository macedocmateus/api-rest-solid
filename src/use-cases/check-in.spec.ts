import { Decimal } from 'generated/prisma/runtime/library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { CheckInUseCase } from './check-in'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in Use Case', () => {
    beforeEach(async () => {
        checkInsRepository = new InMemoryCheckInsRepository()
        gymsRepository = new InMemoryGymsRepository()
        sut = new CheckInUseCase(checkInsRepository, gymsRepository)

        await gymsRepository.create({
            id: 'gym-01',
            title: 'healthcare Gym',
            description: '',
            phone: '',
            latitude: 40.748417,
            longitude: -73.985833,
        })

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to check in', async () => {
        const { checkIn } = await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01',
            userLatitude: 40.748417,
            userLongitude: -73.985833,
        })

        expect(checkIn.id).toEqual(expect.any(String))
    })

    it('should not be able to check in twice in the same day', async () => {
        vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

        await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01',
            userLatitude: 40.748417,
            userLongitude: -73.985833,
        })

        await expect(() =>
            sut.execute({
                gymId: 'gym-01',
                userId: 'user-01',
                userLatitude: 40.748417,
                userLongitude: -73.985833,
            }),
        ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
    })

    it('should be able to check in twice but in different days', async () => {
        vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

        await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01',
            userLatitude: 40.748417,
            userLongitude: -73.985833,
        })

        vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

        const { checkIn } = await sut.execute({
            gymId: 'gym-01',
            userId: 'user-01',
            userLatitude: 40.748417,
            userLongitude: -73.985833,
        })

        expect(checkIn.id).toEqual(expect.any(String))
    })

    it('should not be able to check in on distant gym', async () => {
        gymsRepository.items.push({
            id: 'gym-02',
            title: 'Moviment Gym',
            description: '',
            phone: '',
            latitude: new Decimal(38.897957),
            longitude: new Decimal(77.03656),
        })

        // 38.897957, 77.03656 white house
        // 40.748417, -73.985833 empire state

        await expect(() =>
            sut.execute({
                gymId: 'gym-02',
                userId: 'user-01',
                userLatitude: 40.748417,
                userLongitude: -73.985833,
            }),
        ).rejects.toBeInstanceOf(MaxDistanceError)
    })
})
