export const formatValidationError = (errors) => {

    if(!erros || !erros.issues)
        return'validation failed'


    if(Array.isArray(erros.issues)) 
        return JSON.stringify(erros)


    return JSON.stringify(errors)
}