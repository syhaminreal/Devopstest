import { formatValidationError } from "#utils/format.js"
import { signupSchema } from "../validations/auth.validation"

export const signup = async(req ,res , next) => {
    try {

        const vlaidationResult = signupSchema.safeParse(req.body)


        if(!vlaidationResult.sucess){
            return res.status(400).json({
                error: 'validation failed', 
                deatils: formatValidationError(vlaidationResult.error)
            })
        }

        const {name, email, role} = vlaidationResult.data


        logger.info(` User registered sucessfully: ${email}`)
        res.status(201).json({
            message: ' User registerd',
            user: {
                id:1, name, email,  role
            }
        })
        
    } catch (e) {
        logger.error('Signup erros', e)

        if(e.message === 'User with this email already exists') {
            return res.status(409).json({ error: 'Email already exist'})
        }
        next(e)
    }
}