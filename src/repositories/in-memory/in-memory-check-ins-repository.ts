import { randomUUID } from 'node:crypto'
import type { CheckIn, Prisma } from 'generated/prisma'
import type { CheckInsRepository } from '../check-ins-repository'

export class InMemoryCheckInsRepository implements CheckInsRepository {
    public items: CheckIn[] = []

    async findByUserIdOnDate(userId: string, date: Date) {
        const checkInOnSameDate = this.items.find(
            (checkIn) => checkIn.user_id === userId,
        )

        if (!checkInOnSameDate) {
            return null
        }

        return checkInOnSameDate
    }

    async create(data: Prisma.CheckInUncheckedCreateInput) {
        const checkIn = {
            id: randomUUID(),
            user_id: data.user_id,
            gym_id: data.gym_id,
            is_validated: data.is_validated
                ? new Date(data.is_validated)
                : null,
            createdAt: new Date(),
        }

        this.items.push(checkIn)

        return checkIn
    }
}
