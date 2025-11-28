import dayjs from 'dayjs'
import type { CheckIn } from 'generated/prisma'
import type { CheckInsRepository } from '@/repositories/check-ins-repository'
import { LateCheckInValidationError } from './errors/late-check-in-validation-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface ValidateCheckInUseCaseRequest {
    checkInId: string
}

interface ValidateCheckInUseCaseResponse {
    checkIn: CheckIn
}

export class ValidateCheckInUseCase {
    constructor(private checkInsRepository: CheckInsRepository) {}

    async execute({
        checkInId,
    }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
        const checkIn = await this.checkInsRepository.findById(checkInId)

        if (!checkIn) {
            throw new ResourceNotFoundError()
        }

        // O método diff do dayjs compara uma data no futuro com uma data no passado
        const distanceInMinutesFromCheckInCreation = dayjs(new Date()).diff(
            checkIn.createdAt,
            'minutes',
        )

        if (distanceInMinutesFromCheckInCreation > 20) {
            throw new LateCheckInValidationError()
        }

        checkIn.is_validated = new Date()

        await this.checkInsRepository.save(checkIn)

        return {
            checkIn,
        }
    }
}
