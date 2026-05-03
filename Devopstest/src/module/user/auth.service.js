import logger from "#config/logger.js";
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm";
import { db } from "#config/database.js"
import { user } from "./user.model.js"

export const hashPassword = async(password)=> {
    try {
        return await bcrypt.hash(password, 10)
    } catch (e) {
        logger.error(`Error hashing the password: ${e}`)
        throw new Error('Error hashing')
    }
}

export const createUser = async({ name, email, password, role = 'user'}) => {
    try {
        const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1)

        if(existingUser.length > 0)
            throw new Error('User already exists')

        const password_hash = await hashPassword(password)

        const [newUser] = await db.insert(user).values({ name, email, password: password_hash, role})
            .returning({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })

        logger.info(`User ${newUser.email} created successfully`)
        return newUser
    } catch (e) {
        logger.error(`Error creating the user: ${e}`)
        throw e
    }
}
