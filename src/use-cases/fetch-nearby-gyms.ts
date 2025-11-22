import type { Gym } from 'generated/prisma'
import type { GymsRepository } from '@/repositories/gyms-repository'

interface fetchNearbyGymsUseCaseRequest {
    userLatitude: number
    userLongitude: number
}

interface fetchNearbyGymsUseCaseResponse {
    gyms: Gym[]
}

export class fetchNearbyGymsUseCase {
    constructor(private gymsRepository: GymsRepository) {}

    async execute({
        userLatitude,
        userLongitude,
    }: fetchNearbyGymsUseCaseRequest): Promise<fetchNearbyGymsUseCaseResponse> {
        const gyms = await this.gymsRepository.findManyNearby({
            latitude: userLatitude,
            longitude: userLongitude,
        })

        return { gyms }
    }
}
